
# API Setup

This API reads database credentials from `api/.env`, which is ignored by Git.

## Expected Environment Variables

Copy `api/.env.example` to `api/.env` and fill in the real values for your database host:

```env
DB_HOST=your-ubuntu-db-host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=Voyager_Database
```

If the MySQL server is running on a separate Ubuntu machine, `DB_HOST` should be that machine's LAN IP address or DNS name instead of `localhost`.

## Run The API

From the `api/` directory:

```bash
uvicorn src.main:app --reload
```

Swagger UI will be available at:

`http://127.0.0.1:8000/docs`

## Remote MySQL Checklist

If the API is running on Windows and MySQL is running on an Ubuntu laptop or server, check these first:

1. `DB_HOST` points to the Ubuntu machine's LAN IP or DNS name.
2. MySQL is listening on the network interface you expect, not only on `127.0.0.1`.
3. Port `3306` is allowed through the Ubuntu firewall.
4. The MySQL user is allowed to connect from your Windows machine's host or subnet, not only from `localhost`.
5. The database named in `DB_NAME` already exists and contains the Voyager tables.

Typical symptoms:

- Connection refused or timeout: usually host, firewall, or MySQL bind-address.
- Access denied: usually MySQL user grants or password.
- Unknown database or missing table: schema not loaded yet, or `DB_NAME` is wrong.
