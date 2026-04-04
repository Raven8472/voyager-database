# Records Officer MVP

## Product Frame

The player acts as Voyager's file and records officer. While watching an episode, they maintain official ship records through an LCARS-style workstation.

This is not a general fan wiki editor. The user experience should feel procedural and in-universe:

- open a personnel file
- review current rank, department, designation, and biographical data
- submit a formal personnel action
- leave a durable historical trail behind that change

## Core User Loop

1. Search for a crew member.
2. Open the personnel dossier.
3. Review the current state of the file.
4. Log an official action such as a promotion, demotion, transfer, or status change.
5. See both the updated current record and the new action in history.

## MVP Scope

### Database

- Add `personnel_actions` as the audit trail for dossier changes
- Keep `crew` as the current-state table
- Use `departments` for reassignment targets

### API

- `GET /health`
- `GET /crew`
- `GET /crew/{crew_id}`
- `GET /departments`
- `GET /personnel-actions/recent`
- `POST /personnel-actions`

### Frontend

- LCARS shell layout
- Crew directory with filters
- Personnel dossier
- Action logging form
- Recent actions summary

## Week Focus

Finish the personnel workstation first. Do not expand into every ship subsystem until the user can successfully perform the records-officer loop end to end.
