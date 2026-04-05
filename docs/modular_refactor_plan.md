# Modular Refactor Plan

This branch captures the first backend modularization pass after the V1 release.

Branch:

- `refactor/modular-v2`

## Goal

Reduce the amount of domain logic living in `api/src/main.py` and move the API toward a route-based layout that is easier to maintain, test, and extend.

## What Has Been Modularized So Far

Shared backend support has been moved into:

- `api/src/support.py`

The following API domains now have dedicated route modules:

- `api/src/routes/crew.py`
- `api/src/routes/medical.py`
- `api/src/routes/transporters.py`
- `api/src/routes/replicator.py`
- `api/src/routes/holodeck.py`

`api/src/main.py` now acts more like an app shell:

- app creation
- middleware setup
- router mounting
- remaining auth, systems, and portal-serving endpoints

## Why This Matters

This refactor is not about changing product behavior. It is about making the existing V1 app easier to reason about.

Benefits already gained:

- clearer domain boundaries
- smaller `main.py`
- shared helper functions live in one place
- future route extraction now has a consistent pattern

## Immediate Next Candidates

The next logical backend slices are:

- `auth`
- `systems`

After those, the next major concentration point is the frontend:

- split `frontend/src/App.js` by workspace
- introduce shared UI components and hooks

## Safety Note

This branch is meant to preserve current behavior while improving structure. Compile checks should continue to pass after each extraction step before any push or merge.
