# Code-Quiz-Master

プログラミング学習向けのタイピング・SQL・Linuxクイズアプリです。

## ローカルDB/APIで開発する

Docker Desktopを起動し、リポジトリのルートでPostgreSQLを立ち上げます。

```powershell
docker compose up -d db
Copy-Item .env.local.example .env.local
$env:DATABASE_URL = "postgres://code_quiz_master:local_dev_only@localhost:5432/code_quiz_master"
pnpm --filter @workspace/db push
pnpm --filter @workspace/db seed-content
Remove-Item Env:DATABASE_URL
```

APIを起動するターミナルで `pnpm --filter @workspace/api-server dev`、別のターミナルで `pnpm --filter @workspace/mockup-sandbox dev` を実行します。フロントエンドの `/api` リクエストはローカルAPI（`http://localhost:8787`）へ転送され、問題文はPostgreSQLから取得されます。ローカルAPIは `.env.local` の `DATABASE_URL` を読み込みます。DB/APIの詳細は [lib/db/README.md](lib/db/README.md) を参照してください。

## Replit

このリポジトリは [Replit](https://replit.com/@xie450962/Code-Quiz-Master) からも利用できます。
