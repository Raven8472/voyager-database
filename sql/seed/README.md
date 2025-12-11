# Seed Data

This folder contains SQL seed files used to populate the Voyager database with initial reference data.

The seed data represents a baseline snapshot of the USS Voyager during early operations and is intended to provide meaningful, non-empty tables for development, testing, and demonstration purposes.

## Included Data

The reference data currently includes:
- Ship compartments with realistic location codes
- Departments
- Initial crew roster

These files are intended to be loaded **after** the database schema has been created.

## Usage

To load the reference data after creating the schema:

```sql
SOURCE voyager_reference_data.sql;

