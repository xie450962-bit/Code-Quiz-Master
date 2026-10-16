# Neon Auth setup

## 1. Neon Console

1. 開発用のNeon project/branchを用意し、Managed Better Authを有効にします。Managed Better Authが利用できるリージョンはAWSに限られるため、Neon Consoleでプロジェクトのリージョンを確認してください。
2. Neon Authの設定でEmail/Passwordを有効にし、利用するメール確認設定を決めます。メール確認を有効にする場合は、Neon Authのメール配信設定も確認してください。
3. Trusted domains/originsに `http://localhost:5000` と、公開後のCloudflare Pagesのドメインを登録します。
4. Auth Base URLをコピーします。これは `https://.../neondb/auth` のようなURLです。

## 2. Local environment

リポジトリルートの `.env.local` にAuth Base URLを2つ設定します。

```dotenv
NEON_AUTH_BASE_URL=https://.../neondb/auth
VITE_NEON_AUTH_URL=https://.../neondb/auth
```

`DATABASE_URL` はAPIが結果と問題データを保存するPostgres接続先です。開発用DBを指定し、スキーマを反映します。

```powershell
pnpm --filter @workspace/db push
```

これにより `user_profiles` を作成します。既存の `game_results` のユーザーIDは従来の仮ユーザーIDのまま残り、新しいログインユーザーのランキングには入りません。

起動後、`http://localhost:5000` でアカウント作成またはログインを行います。Neon Authはホスト型サービスなので、ローカルアプリでもインターネット接続が必要です。

## 3. Cloudflare publish

- GitHub repository settings → Secrets and variables → Actions → Variables に `VITE_NEON_AUTH_URL` を追加します。値は公開用Neon Auth Base URLです。Frontend build時に読み込まれます。
- Cloudflare Dashboard → Workers & Pages → `api-server` Worker → Settings → Variables and Secrets に `NEON_AUTH_BASE_URL` を通常のtext variableとして追加します。同じ公開用Auth Base URLを設定してください。
- `api-server` が接続するPostgresには `user_profiles` のスキーマも反映してください。Cloudflare Workerが使うDBがローカルDBと別なら、そのDBに対して `pnpm --filter @workspace/db push` を実行します。
- Neon Authの許可ドメインに、実際に発表で使うPages URLを登録します。独自ドメインを使う場合はそちらも追加します。

Auth Base URLは秘密情報ではありません。Postgres接続文字列やAPI tokenと異なり、GitHub Actions variable / Cloudflare Worker variableに設定し、コードや公開画面に含まれても認証には使えません。

## 4. Verification checklist

1. Localで新規登録、ログイン、ログアウトができる。
2. ゲーム結果を保存できる。
3. ログイン状態でランキングが表示される。
4. ログアウト後、結果保存APIは401を返す。
5. Cloudflare上でも同じ動作を確認する。

ブラウザとNeon Authが別ドメインの場合、SafariなどでサードパーティCookieが制限されることがあります。発表環境で問題が出た場合は、Neon Authの独自ドメイン/リバースプロキシ設定を検討します。
