crew
What it is Main manifest of everyone currently assigned to Voyager: names, rank text, stardate of birth (DOUBLE), planet of origin, species, designation (StarFleet / Maquis / Civilian), service number, and a FK to departments.

voyager_database_dump

Key relationships

crew.department_id → departments.department_id

Player can

Browse the full crew list.

Look up a specific person by name, rank, species, or department.

Filter lists like “all Maquis in Engineering” or “all Vulcans on board.”

Jump from a person’s dossier into their logs (replicator use, transporter events, medical, former crew record).

departments / department
You currently have both a plural and a singular table in the dump; going forward we’ll treat departments as the canonical one and ignore/delete the older department copy.

voyager_database_dump

What it is Lookup table defining the ship’s major departments (Command, Operations, Engineering, Medical, Science, Security, etc.) with an integer PK.

Key relationships

One department → many crew (crew.department_id)

Department IDs can also be re-used by other tables later if you ever need that.

Player can

Filter crew or logs “by department” (e.g., show only Security personnel).

See department headcount / quick stats (optional UI thing later).

formercrew
What it is History of people who are no longer actively aboard: promotions off the ship, transfers, MIA/KIA, etc.

voyager_database_dump

Key relationships

formercrew.CrewID → crew.crew_id (who it was)

One crew member → zero or one former-crew record (at least in this schema).

Player can

Look up “where did this person end up?” for crew who left.

See reason/notes like “Transferred to Alpha Quadrant” or “KIA – Year of Hell” (once you add those columns).

shipcompartments
What it is Dictionary of all physically modeled locations on Voyager. Each row has a compartment code (CompartmentID like 4-050-1), a human-readable name, and an optional designation.

voyager_database_dump

Key relationships

replicatorunits.CompartmentID → shipcompartments.CompartmentID

transporterunits.CompartmentID → shipcompartments.CompartmentID

holodecks.CompartmentID (if present in your earlier schema) → shipcompartments.CompartmentID

Shuttlebay compartments referenced by shuttles status/location text.

Player can

Browse a deck/section list and see what’s in that space (replicators, transporters, holodecks).

Filter logs “by location” — e.g., “all replicator use on Deck 2 Mess Hall.”

replicatorpatterns
What it is The replicator menu library: Pattern ID, name, category (Food, Beverage, Dessert, etc.), origin species, energy cost, description, and last updated stardate.

voyager_database_dump

Key relationships

One pattern → many log entries in replicatorlog.

Player can

Browse available patterns like a menu (“show all coffees” / “show Vulcan dishes”).

Inspect details such as origin species and energy cost.

When viewing a replicator log entry, jump to the pattern’s flavor text.

replicatorunits
What it is Catalog of physical replicators: an ID like R-03-PQ2, type (Food / Multi-Function / Tool), access level (Crew Only / Guest / Restricted), and which compartment it lives in.

voyager_database_dump

Key relationships

replicatorunits.CompartmentID → shipcompartments.CompartmentID

One unit → many rows in replicatorlog.

Player can

See where replicators are on the ship and what kind they are.

Filter logs by unit (“what was ordered from the Mess Hall replicator yesterday?”).

Filter by access level if you want: e.g., “show only Guest replicators.”

replicatorlog
What it is Fact table of individual replicator uses: who (CrewID), which unit, which pattern, and when (Timestamp).

voyager_database_dump

Key relationships

replicatorlog.CrewID → crew.crew_id

replicatorlog.ReplicatorUnitID → replicatorunits.ReplicatorUnitID

replicatorlog.PatternID → replicatorpatterns.PatternID

Player can

From a crew dossier: “What has Janeway replicated this week?”

From a location: “What’s been coming out of the Mess Hall replicator?”

From a pattern: “Who’s been ordering Raktajino lately?”

Run simple timeframe queries: “show all coffee orders between SD 48400–48410.” (No mystery-AI, just straight filters.)

transportableentity
What it is Lookup of “things that can be transported”: each entity has an ID string, a type enum (Crew, Property, Cargo), and a text description (“Captain Janeway’s luggage”, “Emergency rations”, etc.).

voyager_database_dump

Key relationships

transporterlog.EntityID → transportableentity.EntityID

Player can

Browse the list of known transportable items.

From a given entity, jump into its transporter history (“when did these rations arrive?”).

transporterunits
What it is Catalog of transporter pads: TransporterUnitID and the compartment they’re installed in. Currently you’ve got T-01 and T-02 in Transporter Room 1/2.

voyager_database_dump

Key relationships

transporterunits.CompartmentID → shipcompartments.CompartmentID

One unit → many rows in transporterlog.

Player can

See which transporter rooms exist and where they are.

Filter transporter logs by unit (e.g., “Transporter Room 1 activity for this episode”).

transporterlog
What it is Log of transporter events: which unit, which entity, optional crew member operating it, stardate, direction (Inbound/Outbound), destination compartment or off-ship location.

voyager_database_dump

Key relationships

transporterlog.TransporterUnitID → transporterunits.TransporterUnitID

transporterlog.EntityID → transportableentity.EntityID

transporterlog.DestinationCompartmentID → shipcompartments.CompartmentID

transporterlog.CrewID → crew.crew_id

Player can

From a crew member: “Which entities has Tuvok transported recently?”

From an entity: “Track the movement of Janeway’s luggage.”

From a location: “What was beamed into Cargo Bay 1 on SD 48153.42?”

Timeframe queries like “show all transporter activity between SD X and Y.”

Again: straightforward log browsing, not “auto-detect sabotage.”

holodecks & holodeckprograms
What they are

holodecks: physical holodeck bays, each tied to a compartment.

holodeckprograms: catalog of programs; in your earlier schema it likely had program ID, title, rating, author, etc., with a FK back to a holodeck or just a program library.

voyager_database_dump

(Exact columns aren’t super critical for the design doc; the important part is “who ran what, where, when”.)

Key relationships

holodecks.CompartmentID → shipcompartments.CompartmentID

A (future/optional) holodecklog or equivalent would link crew + holodeck + program + time.

Player can

See which holodecks exist and where they are.

Browse available programs.

For a given crew member: “What holodeck programs has Paris been running lately?”

For a given program: “Who has run Fair Haven this week?”

(Right now your dump doesn’t show a dedicated holodeck log table; if you want those last two bullets, we’ll add a tiny holodecklog later.)

shuttles
What it is Roster of shuttles: ID, name, shuttle type, current status (Docked, Away, Destroyed, Unknown), current location (Shuttlebay 1, Shuttlebay 2, Off-Ship), in-service and out-of-service stardates, plus a free-text notes field.

voyager_database_dump

Key relationships

No FKs now (by design: we dropped the compartment FK and just use location enums/text).

Player can

See which shuttles exist, which ones are destroyed, which are out on missions.

Update a shuttle’s status as episodes progress (“Delta Flyer destroyed at SD xxxx”).

Read notes like “Lost in ‘The Chute’” or “Damaged during Borg encounter.”

medicalprofile
What it is One row per crew member with fairly stable medical info: blood type, baseline vitals, allergies, maybe species-specific flags. Exact columns are simple scalar fields, nothing too wild.

voyager_database_dump

Key relationships

medicalprofile.CrewID → crew.crew_id (1-to-1)

Player can

From a dossier, pop open the crew member’s basic medical profile.

Keep this mostly “flavor text” and light stats rather than real-world PHI.

medicalrecords
What it is Per-visit or per-incident medical records tied to crew and stardate — e.g., “sprained wrist,” “knee surgery,” “decompression injury.”

voyager_database_dump

Key relationships

medicalrecords.CrewID → crew.crew_id

One crew member → many records.

Player can

See a chronological list of visits for a given crew member.

Filter by timeframe (“What medical events occurred during this episode?”).

Jump from an incident log (if you add one later) into the associated medical record and vice versa.

powerallotments (low-priority / optional)
What it is Per-crew allowances for soft resources: replicator rations (int) and holodeck hours (DECIMAL). Currently empty, but wired with a FK into crew.

voyager_database_dump

Key relationships

powerallotments.CrewID → crew.crew_id

Player can

If you choose to use it:

View how many rations / hours a crew member is allotted for a given period.

Possibly decrement these when logging replicator or holodeck usage.

Or you can leave this table present but unused as a “future feature” if ration micromanagement ends up feeling like busywork.

High-level: what the player actually does
Putting it together, your actual supported verbs look like:

Browse people

List crew, filter by department/species/designation.

Open a dossier with crew, former-crew, medical profile, logs.

Browse locations

Look at a compartment and see what hardware lives there (replicators, transporters, holodecks).

View all replicator or transporter events in that space for an episode or stardate range.

Browse logs

Replicator: who ordered what, from where, when.

Transporter: what entities moved, via which unit, to which destination, when.

(Later) Holodeck: who ran what program, where, when.

Run simple time-window queries

“Show all transporter events between SD 48150 and 48160.”

“Show all coffee patterns replicated on SD 48315.6.”

Track ships & equipment

Shuttle roster: see which are docked/away/destroyed and update them as the story goes.
