# Voyager Database Roadmap

This roadmap outlines the major milestones for the Voyager Database & API project.

**Figma Roadmap Link:**  
[https://www.figma.com/file/XYZ123/whatever](https://www.figma.com/board/NrH7Nm4jLEVBYyNwVv9eka/Voyager-Dev-Roadmap-Gantt?node-id=0-1&p=f&t=iwzWIoPUDVvnhlWr-0)

## Milestones
- M1: Database Schema Foundation
- M2: Backend API MVP
- M3: LCARS UI v1
- M4: Full Integration + Deployment

## This Week's Delivery Target

Primary goal: ship a playable `Records Officer Workstation` MVP that lets a user watch an episode and log official personnel changes into Voyager's database.

### MVP Pillars

- Crew directory with search and filtering
- Crew dossier view with rank, department, designation, species, service number, and history
- Personnel action logging for promotion, demotion, transfer, status change, commendation, and notes
- LCARS-inspired workstation shell that feels like an in-universe terminal

### Definition Of Done

- The database has a `personnel_actions` table for historical change tracking
- The API can list crew, return a full dossier, and create a personnel action
- The frontend can browse crew records and submit a personnel action
- The current crew record updates after an action is filed
- Recent personnel actions appear in a workstation summary panel

### Stretch Goals

- Episode session tracking
- Former crew workflows
- Medical and transporter dossier tabs
- Validation helpers for canon or timeline consistency
