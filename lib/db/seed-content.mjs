import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prompts = [
  ["it-1", "IT系", "プログラムを変更する前に、現在の動作と変更の目的をチームのメンバーへ共有しましょう。"],
  ["general-1", "一般系", "朝の時間に今日取り組むことを整理しておくと、落ち着いて一日を始めることができます。"],
  ["it-2", "IT系", "入力された情報をそのまま信頼せず、想定した形式や範囲に収まっているかを確認します。"],
  ["general-2", "一般系", "相手に何かを依頼するときは、期限と期待する結果を具体的に伝えることが大切です。"],
  ["it-3", "IT系", "エラーが起きたときは、直前に行った操作と表示された内容を記録して原因を調べます。"],
  ["general-3", "一般系", "新しいことを学ぶときは、小さな目標を決めて少しずつ続けると知識が身につきます。"],
  ["it-4", "IT系", "読みやすい名前を付けると、プログラムの意図が伝わり、後から修正するときにも役立ちます。"],
  ["general-4", "一般系", "会議の内容を簡潔にまとめて共有すると、参加できなかった人にも決定事項が伝わります。"],
  ["it-5", "IT系", "変更を小さな単位に分けて確認すると、問題が起きた場所を見つけやすくなります。"],
  ["general-5", "一般系", "作業の合間に短い休憩を取ることで、集中力を保ちやすくなり、見落としも減らせます。"],
  ["it-6", "IT系", "利用者の立場で画面を操作し、説明がなくても次に何をすればよいか分かるか確かめます。"],
  ["general-6", "一般系", "分からないことを質問するときは、自分で確認した内容も合わせて伝えると話が進みます。"],
];
const q = (id, game, difficulty, question, options, correct) => ({ id, game, difficulty, question, options, correct });
const quizzes = [
  q("sql-basic-select", "sql", "初級", "usersテーブルの全ての列を取得するSQLはどれですか？", ["SELECT * FROM users;", "GET * FROM users;", "SELECT users FROM *;", "READ users;"], 0),
  q("sql-basic-where", "sql", "初級", "ageが20以上の行に絞り込む句はどれですか？", ["ORDER BY age >= 20", "WHERE age >= 20", "GROUP BY age >= 20", "FILTER age >= 20"], 1),
  q("sql-basic-order", "sql", "初級", "nameを昇順に並べる句はどれですか？", ["ORDER name ASC", "SORT BY name", "ORDER BY name ASC", "GROUP BY name ASC"], 2),
  q("sql-standard-group", "sql", "中級", "部署ごとの人数を集計するときに使う句はどれですか？", ["GROUP BY department", "ORDER BY department", "WHERE department", "JOIN department"], 0),
  q("sql-standard-join", "sql", "中級", "共通のuser_idでusersとordersを結合する句はどれですか？", ["MERGE users WITH orders", "JOIN orders ON users.id = orders.user_id", "UNION users AND orders", "GROUP users, orders"], 1),
  q("sql-standard-null", "sql", "中級", "emailがNULLかどうかを調べる条件はどれですか？", ["email = NULL", "email IS NULL", "email == NULL", "email EQUALS NULL"], 1),
  q("sql-advanced-update", "sql", "上級", "idが1のユーザーのemailを変更するSQLはどれですか？", ["UPDATE users SET email = 'a@example.com' WHERE id = 1;", "INSERT email = 'a@example.com' INTO users WHERE id = 1;", "ALTER users SET email = 'a@example.com';", "REPLACE users.email WITH 'a@example.com';"], 0),
  q("sql-advanced-delete", "sql", "上級", "条件に一致する行だけを削除するSQLはどれですか？", ["REMOVE FROM users WHERE ...", "DELETE users WHERE ...", "DELETE FROM users WHERE ...", "DROP ROW users WHERE ..."], 2),
  q("sql-advanced-count", "sql", "上級", "行数を数える集約関数はどれですか？", ["SUM(*)", "TOTAL(*)", "COUNT(*)", "NUMBER(*)"], 2),
  q("linux-basic-pwd", "linux", "初級", "現在の作業ディレクトリを表示するコマンドはどれですか？", ["pwd", "cd", "ls", "whoami"], 0),
  q("linux-basic-cd", "linux", "初級", "作業ディレクトリを /var/log に移動するコマンドはどれですか？", ["pwd /var/log", "cd /var/log", "mv /var/log", "ls /var/log"], 1),
  q("linux-basic-ls", "linux", "初級", "隠しファイルを含めて一覧を表示するコマンドはどれですか？", ["ls -a", "pwd -a", "cat -a", "show -hidden"], 0),
  q("linux-standard-mkdir", "linux", "中級", "新しいディレクトリ reports を作るコマンドはどれですか？", ["newdir reports", "touch reports", "mkdir reports", "mkfile reports"], 2),
  q("linux-standard-grep", "linux", "中級", "app.logからERRORを含む行を探すコマンドはどれですか？", ["find ERROR app.log", "grep ERROR app.log", "cat ERROR app.log", "ls ERROR app.log"], 1),
  q("linux-standard-copy", "linux", "中級", "ファイルをコピーするコマンドと移動するコマンドの組み合わせはどれですか？", ["mv と cp", "cp と mv", "cat と grep", "ls と pwd"], 1),
  q("linux-advanced-chmod", "linux", "上級", "script.shに所有者の実行権限を追加するコマンドはどれですか？", ["chmod u+x script.sh", "chown u+x script.sh", "cp +x script.sh", "grep +x script.sh"], 0),
  q("linux-advanced-rm", "linux", "上級", "ファイル temp.txt を削除するコマンドはどれですか？", ["rm temp.txt", "delete temp.txt", "rmdir temp.txt", "erase -dir temp.txt"], 0),
  q("linux-advanced-ps", "linux", "上級", "実行中のプロセスを一覧表示する代表的なコマンドはどれですか？", ["ps", "pwd", "mkdir", "chmod"], 0),
  q("sql-basic-insert", "sql", "初級", "新しい行を追加する命令はどれですか？", ["ADD INTO", "INSERT INTO", "CREATE ROW", "UPDATE INTO"], 1),
  q("sql-basic-count", "sql", "初級", "行数を数える集約関数はどれですか？", ["SUM(*)", "TOTAL(*)", "COUNT(*)", "NUMBER(*)"], 2),
  q("sql-basic-like", "sql", "初級", "nameが 'A' で始まる行を探す条件はどれですか？", ["name LIKE 'A%'", "name = 'A*'", "name STARTS 'A'", "name MATCH 'A%'"], 0),
  q("sql-basic-limit", "sql", "初級", "取得する行数を10件に制限する句はどれですか？", ["TOP 10", "LIMIT 10", "ROWS 10", "ONLY 10"], 1),
  q("sql-basic-distinct", "sql", "初級", "重複を除いたdepartmentを取得する書き方はどれですか？", ["SELECT UNIQUE department", "SELECT DISTINCT department", "SELECT department WITHOUT DUPLICATES", "SELECT department GROUP"], 1),
  q("sql-basic-delete", "sql", "初級", "usersテーブルの全行を削除する命令はどれですか？", ["DELETE FROM users;", "DROP users;", "REMOVE users;", "CLEAR TABLE users;"], 0),
  q("sql-basic-asc", "sql", "初級", "created_atを新しい順に並べる指定はどれですか？", ["ORDER BY created_at ASC", "ORDER BY created_at DESC", "SORT created_at NEW", "GROUP BY created_at DESC"], 1),
  q("sql-standard-having", "sql", "中級", "GROUP BYで集計した後、件数が5以上のグループに絞る句はどれですか？", ["WHERE COUNT(*) >= 5", "HAVING COUNT(*) >= 5", "FILTER COUNT(*) >= 5", "ORDER BY COUNT(*) >= 5"], 1),
  q("sql-standard-left-join", "sql", "中級", "左側のテーブルの全行を残して結合する句はどれですか？", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "RIGHT ONLY"], 1),
  q("sql-standard-coalesce", "sql", "中級", "NULLの場合に代わりの値を返す関数はどれですか？", ["COALESCE", "REPLACE_NULL", "ISNULL_ONLY", "DEFAULT_TO"], 0),
  q("sql-standard-between", "sql", "中級", "priceが100以上500以下の範囲を指定する条件はどれですか？", ["price BETWEEN 100 AND 500", "price FROM 100 TO 500", "price IN 100..500", "price RANGE 100, 500"], 0),
  q("sql-standard-subquery", "sql", "中級", "サブクエリについて正しい説明はどれですか？", ["SQL文の中に書かれた別のSELECT文", "テーブルを削除する命令", "列に別名を付ける構文", "結果を並べ替える句"], 0),
  q("sql-standard-union", "sql", "中級", "2つのSELECT結果を重複行なしで結合する演算子はどれですか？", ["JOIN", "UNION", "CONCAT", "MERGE INTO"], 1),
  q("sql-standard-index", "sql", "中級", "検索を速くするための索引を作成する命令はどれですか？", ["MAKE INDEX", "CREATE INDEX", "ADD KEY", "BUILD SEARCH"], 1),
  q("sql-advanced-transaction", "sql", "上級", "トランザクションを取り消す命令はどれですか？", ["ROLLBACK", "REVOKE", "UNDO TABLE", "CANCEL QUERY"], 0),
  q("sql-advanced-commit", "sql", "上級", "トランザクションの変更を確定する命令はどれですか？", ["SAVE", "COMMIT", "FLUSH", "PUBLISH"], 1),
  q("sql-advanced-case", "sql", "上級", "条件に応じて値を切り替えるSQL式はどれですか？", ["SWITCH WHEN", "CASE WHEN", "IF GROUP", "CHOOSE BY"], 1),
  q("sql-advanced-window", "sql", "上級", "行を残したまま、グループ内の順位を計算する関数はどれですか？", ["RANK() OVER (...) ", "GROUP_RANK()", "ORDER_RANK()", "COUNT_GROUP()"], 0),
  q("sql-advanced-cte", "sql", "上級", "共通テーブル式（CTE）を定義するキーワードはどれですか？", ["WITH", "DEFINE", "TEMP AS", "LET"], 0),
  q("sql-advanced-exists", "sql", "上級", "サブクエリが1行以上返すかを判定する述語はどれですか？", ["EXISTS", "HAS ROW", "FOUND", "ANY ROWS"], 0),
  q("sql-advanced-isolation", "sql", "上級", "トランザクションの分離レベルを設定する命令はどれですか？", ["SET TRANSACTION ISOLATION LEVEL", "ALTER SESSION LOCKING", "SET QUERY CONSISTENCY", "CREATE ISOLATION"], 0),
  q("linux-basic-cat", "linux", "初級", "テキストファイルの内容を表示するコマンドはどれですか？", ["cat", "pwd", "chmod", "mkdir"], 0),
  q("linux-basic-mv", "linux", "初級", "ファイル名を old.txt から new.txt に変更するコマンドはどれですか？", ["cp old.txt new.txt", "mv old.txt new.txt", "rename old.txt", "edit old.txt new.txt"], 1),
  q("linux-basic-touch", "linux", "初級", "空のファイル note.txt を作成する基本的なコマンドはどれですか？", ["touch note.txt", "mkdir note.txt", "new note.txt", "makefile note.txt"], 0),
  q("linux-basic-whoami", "linux", "初級", "現在のユーザー名を表示するコマンドはどれですか？", ["whoami", "hostname", "pwd", "users -d"], 0),
  q("linux-basic-clear", "linux", "初級", "端末画面を消去するコマンドはどれですか？", ["clear", "clean", "reset-file", "erase"], 0),
  q("linux-basic-head", "linux", "初級", "ファイルの先頭部分を表示するコマンドはどれですか？", ["head", "tail", "begin", "first"], 0),
  q("linux-basic-echo", "linux", "初級", "文字列を端末に表示するコマンドはどれですか？", ["echo", "printline", "say", "writeout"], 0),
  q("linux-standard-tail", "linux", "中級", "ログファイルの末尾10行を表示するコマンドはどれですか？", ["tail -n 10 app.log", "head -n 10 app.log", "cat -n 10 app.log", "last 10 app.log"], 0),
  q("linux-standard-find", "linux", "中級", "現在のディレクトリ以下から .log で終わるファイルを探すコマンドはどれですか？", ["find . -name '*.log'", "grep . '*.log'", "ls -R '*.log'", "search --type log"], 0),
  q("linux-standard-pipe", "linux", "中級", "コマンドの出力を別のコマンドへ渡す記号はどれですか？", ["|", ">", "&&", "<"], 0),
  q("linux-standard-redirect", "linux", "中級", "コマンドの出力をファイルへ上書き保存する記号はどれですか？", [">", "|", "&&", "::"], 0),
  q("linux-standard-env", "linux", "中級", "環境変数PATHの値を表示する方法はどれですか？", ["echo $PATH", "show PATH", "cat PATH", "getenv PATH"], 0),
  q("linux-standard-kill", "linux", "中級", "PIDが1234のプロセスへ終了シグナルを送る基本形はどれですか？", ["kill 1234", "stop process 1234", "rm 1234", "ps -x 1234"], 0),
  q("linux-standard-permissions", "linux", "中級", "ファイルの権限を確認する際に使うコマンドはどれですか？", ["ls -l", "pwd -p", "chmod -l", "stat-user"], 0),
  q("linux-advanced-ssh", "linux", "上級", "公開鍵認証を使ってuserとしてserverへ接続するコマンドはどれですか？", ["ssh user@server", "scp user@server", "telnet-key user server", "connect --key user server"], 0),
  q("linux-advanced-tar", "linux", "上級", "archive.tar.gzを展開する代表的なコマンドはどれですか？", ["tar -xzf archive.tar.gz", "tar -czf archive.tar.gz", "unzip -gzip archive.tar.gz", "gzip --extract archive.tar.gz"], 0),
  q("linux-advanced-sed", "linux", "上級", "テキスト中の文字列を置換する用途でよく使われるコマンドはどれですか？", ["sed", "pwd", "chmod", "whoami"], 0),
  q("linux-advanced-cron", "linux", "上級", "定期実行するジョブの設定に使う仕組みはどれですか？", ["cron", "grep", "sudo", "mount"], 0),
  q("linux-advanced-systemctl", "linux", "上級", "systemd環境でnginxサービスの状態を確認するコマンドはどれですか？", ["systemctl status nginx", "service nginx list-files", "ps nginx status", "systemd nginx show"], 0),
  q("linux-advanced-umask", "linux", "上級", "新規ファイルやディレクトリの既定権限から差し引くマスクを確認するコマンドはどれですか？", ["umask", "chmod", "chown", "access"], 0),
  q("linux-advanced-xargs", "linux", "上級", "標準入力の項目を引数として別コマンドに渡すコマンドはどれですか？", ["xargs", "tee", "cut", "sort"], 0),
];

try {
  await pool.query("BEGIN");
  for (const [id, category, text] of prompts) {
    await pool.query("INSERT INTO typing_prompts (id, category, text) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, text = EXCLUDED.text, active = 1", [id, category, text]);
  }
  for (const item of quizzes) {
    await pool.query("INSERT INTO quiz_questions (id, game_type, difficulty, question, options, correct) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET game_type = EXCLUDED.game_type, difficulty = EXCLUDED.difficulty, question = EXCLUDED.question, options = EXCLUDED.options, correct = EXCLUDED.correct, active = 1", [item.id, item.game, item.difficulty, item.question, item.options, item.correct]);
  }
  await pool.query("COMMIT");
  console.log(`Seeded ${prompts.length} typing prompts and ${quizzes.length} quiz questions.`);
} catch (error) {
  await pool.query("ROLLBACK");
  throw error;
} finally {
  await pool.end();
}
