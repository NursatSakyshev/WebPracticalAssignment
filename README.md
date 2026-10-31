# Space Bounty Hunters API

A REST API for space bounty hunters: a database of wanted criminals and a
journal of bounty-hunting attempts.

**Stack:** Node.js 20 + Express 5, PostgreSQL 16, Docker Compose.

## Database setup / import

The schema and the sample data are in [db/init.sql](db/init.sql):
6 criminals and 12 hunt logs.

### Option 1: Docker (recommended)

```bash
git clone https://github.com/NursatSakyshev/WebPracticalAssignment.git
cd WebPracticalAssignment
docker compose up --build
```

On the first start PostgreSQL runs `db/init.sql` automatically, so the tables
are created and filled. The API is available at **http://localhost:8080**.

To reset the database to the initial data:

```bash
docker compose down -v
docker compose up --build
```

Configuration is read from environment variables. Defaults are set in
[compose.yaml](compose.yaml). To change them, copy `.env.example` to `.env`.

| Variable      | Default                    |
|---------------|----------------------------|
| `APP_PORT`    | `8080`                     |
| `DB_USER`     | `bounty_user`              |
| `DB_PASSWORD` | `bounty_pass`              |
| `DB_NAME`     | `bounty`                   |

### Option 2: Local PostgreSQL (without Docker)

```bash
createdb bounty
psql -d bounty -f db/init.sql

npm install
DB_HOST=localhost DB_USER=<your user> DB_PASSWORD=<your password> DB_NAME=bounty npm start
```

The API then runs on http://localhost:3000.

## Data model

```
criminals 1 ──────< hunt_logs
          (one criminal has many hunt logs)
```

**criminals** (WantedCriminal)

| Column               | Type             | Notes                                   |
|----------------------|------------------|-----------------------------------------|
| `id`                 | serial PK        |                                         |
| `name`               | varchar, null    | real name, may be unknown               |
| `nickname`           | varchar          | required                                |
| `reward`             | integer          | bounty amount, `>= 0`                   |
| `last_latitude`      | double, null     | `-90..90`                               |
| `last_longitude`     | double, null     | `-180..180`, set together with latitude |
| `last_location_note` | text, null       | text description of the last location   |
| `difficulty`         | integer          | `1..10`                                 |
| `armed`              | boolean          |                                         |
| `has_crew`           | boolean          |                                         |
| `escape_master`      | boolean          |                                         |

The last known location can be coordinates, a text note, or both. In the API
it is returned as:

```json
"last_known_location": {
  "coordinates": { "latitude": -4.59, "longitude": 137.44 },
  "note": null
}
```

**hunt_logs** (HuntLog)

| Column        | Type        | Notes                                                    |
|---------------|-------------|----------------------------------------------------------|
| `id`          | serial PK   |                                                          |
| `criminal_id` | integer FK  | references `criminals(id)`, `ON DELETE CASCADE`          |
| `success`     | boolean     | was the criminal captured                                |
| `notes`       | text, null  | description of the encounter                             |
| `created_at`  | timestamptz | `DEFAULT now()`, set by the server, not by the client    |

## API

All endpoints work with and without the trailing slash.

### Criminals

| Method | Endpoint                 | Description                         |
|--------|--------------------------|-------------------------------------|
| GET    | `/api/criminals/`        | List criminals (filters, sorting)   |
| GET    | `/api/criminals/{id}/`   | Criminal details with its hunt logs |

Query parameters for the list (all optional, they can be combined):

| Param           | Example         | Description                    |
|-----------------|-----------------|--------------------------------|
| `min_reward`    | `5000`          | reward >= value                |
| `max_reward`    | `20000`         | reward <= value                |
| `armed`         | `true`/`false`  |                                |
| `has_crew`      | `true`/`false`  |                                |
| `escape_master` | `true`/`false`  |                                |
| `sort`          | `reward`, `-reward` | ascending / descending by reward (default: by id) |

Example: `GET /api/criminals/?min_reward=5000&armed=true&sort=-reward`

### Hunt logs

| Method | Endpoint             | Description                          | Success |
|--------|----------------------|--------------------------------------|---------|
| GET    | `/api/hunts/`        | List hunt logs (`?criminal_id=5`)    | 200     |
| GET    | `/api/hunts/{id}/`   | One hunt log                         | 200     |
| POST   | `/api/hunts/`        | Record a capture attempt             | 201     |
| PATCH  | `/api/hunts/{id}/`   | Update `success` and/or `notes`      | 200     |
| DELETE | `/api/hunts/{id}/`   | Delete a hunt log                    | 204     |

POST body:

```json
{
  "criminal_id": 3,
  "success": false,
  "notes": "Target escaped through an asteroid field."
}
```

- `criminal_id` (required) must reference an existing criminal.
- `success` (required) must be a boolean.
- `notes` (optional) string or `null`.
- `id` and `created_at` are generated by the server. Sending them returns `400`.

PATCH body: any of `success`, `notes`. `criminal_id` cannot be changed.

Response example:

```json
{
  "id": 13,
  "criminal_id": 3,
  "criminal_nickname": "Silver Fox",
  "success": false,
  "notes": "Target escaped through an asteroid field.",
  "created_at": "2026-10-31T08:36:07.791Z"
}
```

### Errors

| Status | When                                                              |
|--------|-------------------------------------------------------------------|
| 400    | invalid id, invalid query params, invalid body, unknown criminal  |
| 404    | criminal / hunt log / route not found                             |
| 500    | unexpected server error                                           |

```json
{ "error": "Validation failed", "details": ["criminal with id 999 does not exist"] }
```

## Postman collection

[postman/Space-Bounty-Hunters.postman_collection.json](postman/Space-Bounty-Hunters.postman_collection.json)

Import it in Postman and click **Run** to run all requests in order. It contains:

- **Criminals**: listing, filtering, sorting, details
- **Hunt logs**: list, filter by criminal, create, get, update, delete
- **Invalid requests**: 400 and 404 cases

Every request has tests. `Create hunt log` saves the new id in the `huntId`
variable that the next requests use. `baseUrl` is `http://localhost:8080`.

From the terminal:

```bash
npx newman run postman/Space-Bounty-Hunters.postman_collection.json
```

## Project structure

```
├── compose.yaml            # api + db services, network, volume
├── Dockerfile              # backend image
├── .env.example
├── db/init.sql             # schema + sample data
├── postman/                # exported Postman collection
└── src/
    ├── server.js           # starts the server
    ├── app.js              # Express app, routes
    ├── config.js           # environment variables
    ├── db.js               # PostgreSQL pool
    ├── routes/             # criminals.js, hunts.js
    ├── repositories/       # SQL queries
    ├── validators/         # request validation
    └── middleware/         # logging, error handling
```
