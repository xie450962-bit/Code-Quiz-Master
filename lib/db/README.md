# Game results database

The API stores all game runs in the PostgreSQL `game_results` table. Apply the
schema once with `pnpm --filter @workspace/db push` while `DATABASE_URL` points
to the target PostgreSQL database.

Typing prompts and quiz questions are stored in `typing_prompts` and
`quiz_questions`. After applying the schema, load the starter content with
`pnpm --filter @workspace/db seed-content` while `DATABASE_URL` points to the
same database. The seed command is safe to rerun and refreshes the bundled
starter questions. Typing categories and quiz difficulty choices are derived
from active rows, so adding content with a new category or difficulty makes it
available in the game setup screen.

For Cloudflare Workers, create a Hyperdrive configuration for the same database,
then add its non-secret ID to `artifacts/api-server/wrangler.toml`:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<the Hyperdrive configuration ID>"
```

For Node/Replit, provide `DATABASE_URL` to the API server. The Pages site reaches
the API through its `API` service binding; the API Worker must be deployed before
Pages. Keep the database URL and credentials in environment secrets, never in Git.

For local development, `compose.yaml` provides a PostgreSQL 16 database. Start it
with `docker compose up -d db`, set `DATABASE_URL` to
`postgres://code_quiz_master:local_dev_only@localhost:5432/code_quiz_master`,
then apply the schema and starter content:

```powershell
$env:DATABASE_URL = "postgres://code_quiz_master:local_dev_only@localhost:5432/code_quiz_master"
pnpm --filter @workspace/db push
pnpm --filter @workspace/db seed-content
Remove-Item Env:DATABASE_URL
```

Copy `.env.local.example` to `.env.local`. Run the API with
`pnpm --filter @workspace/api-server dev`, then run the frontend with
`pnpm --filter @workspace/mockup-sandbox dev`. The Node API reads
`DATABASE_URL` from `.env.local`; Vite forwards `/api` requests to the API at
`http://localhost:8787`. Cloudflare Pages uses its service-binding function.

The starter seed is enough to populate a fresh local database. To use the exact
production content and results, restore an authorized PostgreSQL dump instead;
do not put production credentials in `.env.local.example` or commit them.
