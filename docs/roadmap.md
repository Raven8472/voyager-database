# Voyager Database Roadmap

This roadmap outlines the major milestones for the Voyager Database & API project.

**Figma Roadmap Link:**  
[https://www.figma.com/file/XYZ123/whatever](https://www.figma.com/board/NrH7Nm4jLEVBYyNwVv9eka/Voyager-Dev-Roadmap-Gantt?node-id=0-1&p=f&t=iwzWIoPUDVvnhlWr-0)

## Milestones
- M1: Database Schema Foundation
- M2: Backend API MVP
- M3: LCARS Portal V1
- M4: V1 Release Cleanup and Push
- M5: V2 Expansion

## V1 Status

The project has now reached a playable V1 state.

Current shipped areas:

- Personnel workspace
- Medical workspace
- Transporter workspace
- Replicator workspace
- Holodeck workspace
- Ship Systems workspace
- Authenticated portal shell served from the API

## V1 Definition Of Done

- Base schema and user-data schema are documented and aligned
- FastAPI serves both API routes and the production portal build
- The portal supports authenticated record logging
- Canon seed data and user-authored data can coexist cleanly
- LCARS styling is strong enough for a V1 release candidate

## V2 Candidates

- Decompose the large frontend app into workspace-specific modules
- Revisit comments, response models, and API organization
- Decide whether shuttle data stays catalog-only or becomes interactive
- Tighten visual consistency on record-card states and subpanels
- Add safer migration scripts for live schema updates
