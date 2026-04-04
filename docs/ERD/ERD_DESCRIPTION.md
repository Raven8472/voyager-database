# ERD Description

This document explains the tables that matter to the current V1 portal and how they support the workstation loops.

## Base Reference Tables

### `crew`

Main manifest of people currently assigned to Voyager.

Key fields:

- names
- rank text
- birth stardate
- planet of origin
- species
- designation
- service number
- `department_id`

Key relationship:

- `crew.department_id -> departments.department_id`

Supports:

- crew directory browsing
- dossier lookup by person
- filtering by species, rank, department, or designation

### `departments`

Lookup table for Command, Operations, Engineering, Medical, Security, and related ship departments.

Key relationship:

- one department to many crew

Supports:

- directory filtering
- department labeling across records

### `formercrew`

History table for people no longer actively aboard.

Key relationship:

- `formercrew.CrewID -> crew.crew_id`

Supports:

- dossier history
- departure reason and reassignment notes

### `shipcompartments`

Dictionary of modeled locations on Voyager.

Key relationships:

- `replicatorunits.CompartmentID -> shipcompartments.CompartmentID`
- `transporterunits.CompartmentID -> shipcompartments.CompartmentID`
- `holodecks.CompartmentID -> shipcompartments.CompartmentID`

Supports:

- Ship Systems browsing
- location-aware equipment lookup

## Replicator Tables

### `replicatorunits`

Catalog of physical replicators and the compartments they live in.

### `replicatorpatterns`

Menu/catalog data for replicator output definitions.

### `replicatorlog`

Base canon-style replicator usage events.

Key relationships:

- `replicatorlog.CrewID -> crew.crew_id`
- `replicatorlog.ReplicatorUnitID -> replicatorunits.ReplicatorUnitID`
- `replicatorlog.PatternID -> replicatorpatterns.PatternID`

Supports:

- who ordered what
- where it was replicated
- pattern-level browsing

## Transporter Tables

### `transporterunits`

Catalog of transporter pads installed on Voyager.

### `user_transporter_events`

Per-user transporter activity log used by the portal.

Key relationship:

- `user_transporter_events.user_id -> users.user_id`

Stores:

- transporter unit
- optional operator
- stardate
- direction
- ship-side control location
- optional off-ship location

### `user_transporter_event_passengers`

Ordered passenger manifest attached to one transporter event.

Key relationship:

- `user_transporter_event_passengers.event_id -> user_transporter_events.event_id`

Supports:

- multi-person transporter logs
- passenger order preservation

## Holodeck Tables

### `holodecks`

Physical holodeck bays, each tied to a ship compartment.

### `holodeckprograms`

Catalog of base programs with a home/origin holodeck, creator, access level, genre, and description.

Key relationship:

- `holodeckprograms.HolodeckID -> holodecks.HolodeckID`

### `holodeckusagelog`

Base holodeck usage history.

Key relationships:

- `holodeckusagelog.CrewID -> crew.crew_id`
- `holodeckusagelog.ProgramID -> holodeckprograms.ProgramID`
- `holodeckusagelog.HolodeckID -> holodecks.HolodeckID`

Supports:

- crew-level holodeck history
- program popularity
- comparisons between a program's home holodeck and where it was actually run

### `user_holodeck_programs`

Per-user program catalog additions created from the Holodeck workspace.

Key relationship:

- `user_holodeck_programs.user_id -> users.user_id`

### `user_holodeck_logs`

Per-user holodeck session log used by the live portal.

Key relationship:

- `user_holodeck_logs.user_id -> users.user_id`

Supports:

- logging fresh sessions without mutating canon seed data
- mixing base programs with user-authored programs in one workspace

## Medical Tables

### `medicalprofile`

Stable, mostly one-row-per-person medical profile data.

Key relationship:

- `medicalprofile.CrewID -> crew.crew_id`

### `medicalrecords`

Medical visit and treatment history.

Key relationship:

- `medicalrecords.CrewID -> crew.crew_id`

Supports:

- chronological care history
- medical dossier viewing

## Shuttle Table

### `shuttles`

Voyager shuttle roster with status, location, and notes.

Current V1 note:

- this table remains in the base schema as reference/catalog data
- shuttle logging is not an active portal workspace in V1

## Auth And User Save Tables

### `users`

Account table for workstation access.

### `user_sessions`

Session/token table used by bearer auth.

### Other user-owned write tables

These let the app layer player-authored records on top of the base Voyager data set:

- `user_custom_crew`
- `user_personnel_actions`
- `user_medical_profiles`
- `user_medical_records`
- `user_replicator_patterns`
- `user_replicator_logs`
- `user_holodeck_programs`
- `user_holodeck_logs`
- `user_transporter_events`
- `user_transporter_event_passengers`

## What The Player Can Do In V1

### Browse people

- search and filter the crew directory
- open dossiers
- review personnel history and medical context

### Browse locations

- inspect ship compartments
- see what replicators, transporters, and holodecks are installed there

### Log activity

- personnel changes
- medical visits
- replicator usage
- transporter events
- holodeck sessions

### Browse activity history

- who ordered what
- who transported where
- who ran which holodeck program
- what systems exist in each compartment
