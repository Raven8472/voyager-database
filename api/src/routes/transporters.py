
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..support import (
    build_display_name,
    ensure_user_data_ready,
    execute_write,
    fetch_all,
    fetch_one,
    get_crew_identity,
    get_current_user,
    user_data_tables_exist,
)

router = APIRouter(prefix="/transporter", tags=["transporter"])


class TransporterLogCreate(BaseModel):
    transporter_unit_id: str = Field(min_length=1, max_length=10)
    operator_crew_id: Optional[int] = None
    stardate: str = Field(min_length=1, max_length=20)
    transport_direction: str = Field(min_length=1, max_length=20)
    ship_location_id: str = Field(min_length=1, max_length=10)
    off_ship_location: Optional[str] = Field(default=None, max_length=100)
    passenger_crew_ids: list[int] = Field(default_factory=list, max_length=10)


@router.get("/units")
def get_transporter_units(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                tu.TransporterUnitID AS unit_id,
                sc.CompartmentID AS compartment_id,
                sc.CompartmentName AS compartment_name
            FROM transporterunits tu
            INNER JOIN shipcompartments sc
                ON sc.CompartmentID = tu.CompartmentID
            ORDER BY tu.TransporterUnitID
            """
        )
    except Exception as e:
        return {"error": str(e)}


@router.get("/locations")
def get_transporter_locations(current_user=Depends(get_current_user)):
    try:
        return fetch_all(
            """
            SELECT
                CompartmentID AS compartment_id,
                CompartmentName AS compartment_name
            FROM shipcompartments
            WHERE CompartmentName = 'Bridge'
               OR CompartmentName = 'Engineering Core'
               OR CompartmentName LIKE 'Transporter Room%%'
            ORDER BY CompartmentName
            """
        )
    except Exception as e:
        return {"error": str(e)}


@router.get("/logs")
def get_transporter_logs(
    search: Optional[str] = Query(default=None),
    current_user=Depends(get_current_user),
):
    try:
        if not user_data_tables_exist():
            return []

        event_rows = fetch_all(
            """
            SELECT
                event_id,
                transporter_unit_id,
                operator_crew_id,
                stardate,
                transport_direction,
                ship_location_id,
                off_ship_location,
                created_at
            FROM user_transporter_events
            WHERE user_id = %s
            ORDER BY event_id DESC
            """,
            (current_user["user_id"],),
        )

        if not event_rows:
            return []

        passenger_rows = fetch_all(
            """
            SELECT
                passenger_id,
                event_id,
                crew_id,
                passenger_order
            FROM user_transporter_event_passengers
            WHERE event_id IN (
                SELECT event_id
                FROM user_transporter_events
                WHERE user_id = %s
            )
            ORDER BY event_id DESC, passenger_order ASC
            """,
            (current_user["user_id"],),
        )
        passenger_map = {}
        for row in passenger_rows:
            passenger_map.setdefault(row["event_id"], []).append(row)

        unit_map = {
            row["unit_id"]: row
            for row in fetch_all(
                """
                SELECT
                    tu.TransporterUnitID AS unit_id,
                    sc.CompartmentName AS compartment_name
                FROM transporterunits tu
                INNER JOIN shipcompartments sc
                    ON sc.CompartmentID = tu.CompartmentID
                """
            )
        }
        location_map = {
            row["compartment_id"]: row["compartment_name"]
            for row in fetch_all(
                """
                SELECT
                    CompartmentID AS compartment_id,
                    CompartmentName AS compartment_name
                FROM shipcompartments
                """
            )
        }

        logs = []
        for event in event_rows:
            operator = get_crew_identity(current_user["user_id"], event["operator_crew_id"]) if event["operator_crew_id"] else None
            passengers = []
            for passenger in passenger_map.get(event["event_id"], []):
                identity = get_crew_identity(current_user["user_id"], passenger["crew_id"])
                if identity:
                    passengers.append(
                        {
                            "crew_id": identity["crew_id"],
                            "first_name": identity["first_name"],
                            "last_name": identity["last_name"],
                            "display_name": build_display_name(identity["first_name"], identity["last_name"]),
                            "passenger_order": passenger["passenger_order"],
                        }
                    )

            resolved = {
                "event_id": event["event_id"],
                "transporter_unit_id": event["transporter_unit_id"],
                "transporter_room": unit_map.get(event["transporter_unit_id"], {}).get("compartment_name"),
                "operator_crew_id": event["operator_crew_id"],
                "operator_display_name": build_display_name(operator["first_name"], operator["last_name"]) if operator else "No operator logged",
                "stardate": event["stardate"],
                "transport_direction": event["transport_direction"],
                "ship_location_id": event["ship_location_id"],
                "ship_location_name": location_map.get(event["ship_location_id"]),
                "off_ship_location": event["off_ship_location"],
                "passengers": passengers,
                "passenger_count": len(passengers),
                "created_at": event["created_at"],
            }

            search_blob = " ".join(
                [
                    resolved["transporter_unit_id"] or "",
                    resolved["transporter_room"] or "",
                    resolved["operator_display_name"] or "",
                    resolved["ship_location_name"] or "",
                    resolved["off_ship_location"] or "",
                    " ".join(passenger["display_name"] for passenger in passengers),
                ]
            ).lower()
            if search and search.strip().lower() not in search_blob:
                continue
            logs.append(resolved)

        return logs
    except Exception as e:
        return {"error": str(e)}


@router.post("/logs")
def create_transporter_log(log: TransporterLogCreate, current_user=Depends(get_current_user)):
    try:
        ensure_user_data_ready()

        passenger_ids = [crew_id for crew_id in log.passenger_crew_ids if crew_id]
        deduped_passenger_ids = []
        for crew_id in passenger_ids:
            if crew_id not in deduped_passenger_ids:
                deduped_passenger_ids.append(crew_id)
        passenger_ids = deduped_passenger_ids

        if not passenger_ids:
            raise HTTPException(status_code=422, detail="At least one transported crew member is required")
        if len(passenger_ids) > 10:
            raise HTTPException(status_code=422, detail="Transport logs support up to 10 crew members per event")
        if log.transport_direction not in ("Inbound", "Outbound"):
            raise HTTPException(status_code=422, detail="Transport direction must be Inbound or Outbound")

        unit_exists = fetch_one(
            "SELECT TransporterUnitID FROM transporterunits WHERE TransporterUnitID = %s",
            (log.transporter_unit_id,),
        )
        if not unit_exists:
            raise HTTPException(status_code=404, detail="Transporter unit not found")

        location_exists = fetch_one(
            """
            SELECT CompartmentID
            FROM shipcompartments
            WHERE CompartmentID = %s
              AND (
                  CompartmentName = 'Bridge'
                  OR CompartmentName = 'Engineering Core'
                  OR CompartmentName LIKE 'Transporter Room%%'
              )
            """,
            (log.ship_location_id,),
        )
        if not location_exists:
            raise HTTPException(status_code=404, detail="Transporter control location must be Bridge, Engineering, or a transporter room")

        if log.operator_crew_id is not None and not get_crew_identity(current_user["user_id"], log.operator_crew_id):
            raise HTTPException(status_code=404, detail="Transporter operator not found")

        for crew_id in passenger_ids:
            if not get_crew_identity(current_user["user_id"], crew_id):
                raise HTTPException(status_code=404, detail=f"Passenger crew record not found: {crew_id}")

        event_id = execute_write(
            """
            INSERT INTO user_transporter_events (
                user_id,
                transporter_unit_id,
                operator_crew_id,
                stardate,
                transport_direction,
                ship_location_id,
                off_ship_location
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user["user_id"],
                log.transporter_unit_id,
                log.operator_crew_id,
                log.stardate,
                log.transport_direction,
                log.ship_location_id,
                log.off_ship_location,
            ),
        )

        for index, crew_id in enumerate(passenger_ids, start=1):
            execute_write(
                """
                INSERT INTO user_transporter_event_passengers (
                    event_id,
                    crew_id,
                    passenger_order
                ) VALUES (%s, %s, %s)
                """,
                (event_id, crew_id, index),
            )

        return {"status": "ok", "event_id": event_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}
