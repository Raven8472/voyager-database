# voyager-database
🌌 Star Trek Voyager Database (LCARS-Themed API Project)

This repository contains a fully structured Star Trek Voyager–inspired relational database, designed for interactive applications, LCARS-themed UIs, and future API development.
The goal is to provide a clean, normalized, game-ready dataset that reflects the inner workings of a Federation starship — including crew information, replicator usage, transporter logs, and more.

This project is being built gradually into a full backend system that powers a text-RPG, UI dashboard, or investigative toolkit.

🚀 Project Goals
✔ Build a normalized SQL database inspired by the USS Voyager
✔ Support log-driven gameplay and queries
✔ Create LCARS-style front-end for interacting with the data
✔ Develop REST API endpoints to access the Voyager DB
✔ Maintain clear, documented schema & ERD for all tables
🗂 Repository Structure
voyager-database/
│
├── docs/
│   ├── ERD/
│   │   ├── voyager_erd_v1.png
│   │   ├── ERD_DESCRIPTION.md
│   │   ├── Screenshot_*.png
│   │   └── (diagram exports)
│   └── roadmap.md
│
├── LICENSE
└── README.md

🧬 Current Core Database Schema

The database supports the following core systems:

👥 Crew System

Master crew roster with human & alien species

Rank table with standardized Starfleet ranks

Department table for assignment & role clarity

Former crew table for transfers, casualties, or departures

🍽 Replicator System

Replicator Units (type, location, access level)

Replicator Patterns (foods, beverages, alien dishes)

Replicator Log (who used what & when)

🌀 Transporter System

Transporter Units (shuttlebay, sickbay, cargo Bay)

Transporter Log (crew transports, cargo transports)

Transportable Entity table (patterns/items transported)

🚀 Shuttle System

Shuttle registry (type, service dates, status)

🧼 Medical System

Medical profiles (baseline attributes)

Medical records (sickbay events, stardates)

(Other retired tables removed for simplicity and future expansion.)

A detailed explanation of each table is provided here:
👉 docs/ERD/ERD_DESCRIPTION.md

📊 Entity Relationship Diagram (ERD)

The complete ERD is included in:

👉 docs/ERD/Screenshot 2025-11-29 140738.png

This image reflects the entire normalized schema used by the project.

⏳ Project Roadmap

See:
👉 docs/roadmap.md

Current active tasks:

Finalize schema & clean legacy tables

Add reference data (starter patterns, crew, departments)

Define API folder structure

Build LCARS UI layout

Create backend + front-end tech stack plan

🔧 Technologies (Planned)
Layer	Tooling
Database	MySQL 8
API	Node/Express or Python/FastAPI (TBD)
UI	LCARS-themed HTML/CSS/React
Tools	VS Code, SQLTools, GitHub Projects
🤝 Contributions

This is a personal development and worldbuilding project.
Contributions, issues, and suggestions are welcome — especially regarding schema design & LCARS UI ideas.

📜 License

MIT License — free to use and modify.

⭐ Final Notes

This project aims to feel like:

“If Starfleet had an official database system for Voyager.”

Everything — from replicator logs to crew rosters — is designed to fit canon, gameplay goals, and a clean engineering approach.

