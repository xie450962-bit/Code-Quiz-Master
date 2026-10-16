# Code-Quiz-Master

プログラミング学習向けのタイピング・SQL・Linuxクイズアプリです。

## ローカル開発

Node.js、pnpm、Docker Desktopを用意し、リポジトリのルートで初回セットアップを行います。

```powershell
pnpm install
Copy-Item .env.local.example .env.local # すでにある場合はスキップ
pnpm db:up
$env:DATABASE_URL = "postgres://code_quiz_master:local_dev_only@localhost:5432/code_quiz_master"
pnpm --filter @workspace/db push
pnpm --filter @workspace/db seed-content
Remove-Item Env:DATABASE_URL
```

アプリ全体を起動します。

```powershell
pnpm dev
```

フロントエンドは `http://localhost:5000`、APIは `http://localhost:8787` で起動します。フロントエンドの `/api` リクエストはローカルAPIへ転送され、問題文はPostgreSQLから取得されます。APIは `.env.local` の `DATABASE_URL` を読み込みます。

## 認証（Neon Auth）

ログイン・アカウント作成にはNeonのManaged Better Authを使います。Neon ConsoleでAuthを有効にした後、Auth Base URLを `.env.local` の `NEON_AUTH_BASE_URL` と `VITE_NEON_AUTH_URL` の両方に設定してください。開発では本番と分けたNeonブランチを使うのがおすすめです。フロントはNeon Authに接続するため、ローカルでもインターネット接続が必要です。

この実装では、APIがNeon AuthのJWTを検証してユーザーIDを確定します。結果保存・ランキングAPIはログイン必須です。問題文の取得APIはログイン不要です。新しい `user_profiles` テーブルを使うため、`.env.local` の `DATABASE_URL` を対象DBに向けた状態で一度 `pnpm --filter @workspace/db push` を実行してください。

Cloudflare公開時は、GitHubリポジトリのActions variable `VITE_NEON_AUTH_URL` に本番Auth Base URLを登録してください。Cloudflare Workersの `api-server` にも `NEON_AUTH_BASE_URL` を通常のWorker variableとして設定してください。Auth Base URLは秘密鍵ではありません。Neon Auth側の許可ドメインには `http://localhost:5000` と本番PagesのURLを登録します。詳しい手順は [`docs/neon-auth-setup.md`](docs/neon-auth-setup.md) を参照してください。

主なコマンド:

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | APIとフロントエンドを起動 |
| `pnpm db:up` | ローカルPostgreSQLを起動 |
| `pnpm db:down` | PostgreSQLを停止 |
| `pnpm build` | 各ワークスペースをビルド |
| `pnpm typecheck` | TypeScript型チェック |
| `pnpm test` | DB/API/フロントエンドのテスト |

DB/APIの詳細は [lib/db/README.md](lib/db/README.md) を参照してください。

## Replit

このリポジトリは [Replit](https://replit.com/@xie450962/Code-Quiz-Master) からも利用できます。
