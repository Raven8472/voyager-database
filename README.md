# voyager-database  
Star Trek Voyager Database (LCARS-Themed Project)

This repository contains a fully structured Star Trek Voyager–inspired relational database, designed for interactive applications, LCARS-themed user interfaces, and future API development.  
The project provides a clean, normalized, game-ready dataset that reflects the inner workings of a Federation starship, including crew information, ship compartments, replicator systems, transporter activity, and medical records.

The database currently includes a complete schema and an initial reference data set, and is being expanded gradually into a full backend system suitable for a text-based RPG, UI dashboard, or investigative toolkit.

---

## Project Goals

- Build a normalized SQL database inspired by the USS Voyager  
- Support log-driven gameplay, queries, and system simulation  
- Enable future LCARS-style front-end interaction  
- Provide a foundation for REST API access  
- Maintain a clearly documented schema and ERD  

---

## Repository Structure

voyager-database/
│
├── docs/
│ ├── ERD/
│ │ ├── voyager_erd_v1.png
│ │ ├── ERD_DESCRIPTION.md
│ │ ├── Screenshot_*.png
│ │ └── diagram exports
│ └── roadmap.md
│
├── sql/
│ ├── schema/
│ │ └── v1/
│ │ └── voyager_schema.sql
│ └── seed/
│ └── voyager_reference_data.sql
│
├── LICENSE
└── README.md


---

## Current Core Database Schema

The database currently supports the following core systems.

### Crew System
- Master crew roster supporting human and alien species  
- Department-based assignment and role structure  
- Service numbers and designations  
- Former crew tracking for transfers or departures  

### Ship Compartment System
- Detailed compartment location codes  
- Named compartments with functional designations  
- Centralized location reference used by ship systems  

### Replicator System
- Replicator units with access levels and locations  
- Replicator patterns and energy usage  
- Replicator usage logging  

### Transporter System
- Transporter units mapped to ship compartments  
- Transportable entity definitions  
- Transporter logs for personnel and cargo movement  

### Shuttle System
- Shuttle registry with service status and location tracking  

### Medical System
- Medical profiles linked to crew members  
- Medical records for sickbay visits and treatments  

Some earlier experimental tables have been retired to keep the schema focused and maintainable.

A detailed explanation of each table is provided in:

docs/ERD/ERD_DESCRIPTION.md


---

## Entity Relationship Diagram (ERD)

The complete ERD for the current schema is included here:

docs/ERD/ERD.png



This diagram reflects the full normalized structure of the database as implemented.

---

## Reference Data

This repository includes a starter data pack containing:
- Initial crew roster (including Season 1 personnel)
- Departments
- Ship compartments with realistic location codes

The reference data is provided in:

sql/seed/voyager_reference_data.sql



This allows the database to be recreated with meaningful data rather than empty tables.

---

## Project Roadmap

The current development roadmap is documented in:

docs/roadmap.md



Active and upcoming work includes:
- Final schema validation and cleanup  
- API structure definition  
- LCARS-style UI layout planning  
- Backend and frontend technology selection  

---

## Technologies

| Layer     | Tooling |
|----------|---------|
| Database | MySQL 8 |
| API      | Node/Express or Python/FastAPI (TBD) |
| UI       | LCARS-themed HTML/CSS/React |
| Tools    | VS Code, SQLTools, GitHub Projects |

---

## Contributions

This is a personal development and worldbuilding project.  
Issues, suggestions, and design feedback are welcome, particularly around schema design and LCARS-style UI concepts.

---

## License

MIT License — free to use and modify.

---

## Final Notes

This project is designed to answer the question:

> *If Starfleet maintained an official database system for Voyager, what would it look like?*

All systems are modeled with a focus on canonical plausibility, gameplay utility, and clean engineering.

