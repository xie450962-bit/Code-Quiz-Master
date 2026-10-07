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

For local development, run the API with `PORT=8787` and `DATABASE_URL` set, then
run the frontend with `API_SERVER_URL=http://localhost:8787`. Vite forwards `/api`
requests to the local API; Cloudflare Pages uses its service-binding function.
