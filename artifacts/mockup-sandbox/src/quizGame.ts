export type QuizGame = "sql" | "linux";

export type QuizQuestion = {
  id: string;
  question: string;
  options: readonly string[];
  correct: number;
};

export type QuizResult = {
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
};

export const QUIZ_QUESTIONS: Record<QuizGame, readonly QuizQuestion[]> = {
  sql: [
    { id: "sql-select", question: "usersテーブルの全ての列を取得するSQLはどれですか？", options: ["SELECT * FROM users;", "GET * FROM users;", "SELECT users FROM *;", "READ users;"], correct: 0 },
    { id: "sql-where", question: "ageが20以上の行に絞り込む句はどれですか？", options: ["ORDER BY age >= 20", "WHERE age >= 20", "GROUP BY age >= 20", "FILTER age >= 20"], correct: 1 },
    { id: "sql-order-by", question: "nameを昇順に並べるSQLはどれですか？", options: ["ORDER name ASC", "SORT BY name", "ORDER BY name ASC", "GROUP BY name ASC"], correct: 2 },
    { id: "sql-group-by", question: "部署ごとの人数を集計するときに使う句はどれですか？", options: ["GROUP BY department", "ORDER BY department", "WHERE department", "JOIN department"], correct: 0 },
    { id: "sql-join", question: "usersとordersを共通のuser_idで結合する句はどれですか？", options: ["MERGE users WITH orders", "JOIN orders ON users.id = orders.user_id", "UNION users AND orders", "GROUP users, orders"], correct: 1 },
    { id: "sql-insert", question: "usersテーブルに新しい行を追加する命令はどれですか？", options: ["ADD INTO users", "UPDATE users", "INSERT INTO users", "CREATE ROW users"], correct: 2 },
    { id: "sql-update", question: "idが1のユーザーのemailを変更するSQLはどれですか？", options: ["UPDATE users SET email = 'a@example.com' WHERE id = 1;", "INSERT email = 'a@example.com' INTO users WHERE id = 1;", "ALTER users SET email = 'a@example.com';", "REPLACE users.email WITH 'a@example.com';"], correct: 0 },
    { id: "sql-delete", question: "条件に一致する行だけを削除するSQLはどれですか？", options: ["REMOVE FROM users WHERE ...", "DELETE users WHERE ...", "DELETE FROM users WHERE ...", "DROP ROW users WHERE ..."], correct: 2 },
    { id: "sql-null", question: "値がNULLかどうかを調べる条件はどれですか？", options: ["email = NULL", "email IS NULL", "email == NULL", "email EQUALS NULL"], correct: 1 },
    { id: "sql-aggregate", question: "行数を数える集約関数はどれですか？", options: ["SUM(*)", "TOTAL(*)", "COUNT(*)", "NUMBER(*)"], correct: 2 },
  ],
  linux: [
    { id: "linux-pwd", question: "現在の作業ディレクトリを表示するコマンドはどれですか？", options: ["pwd", "cd", "ls", "whoami"], correct: 0 },
    { id: "linux-cd", question: "作業ディレクトリを /var/log に移動するコマンドはどれですか？", options: ["pwd /var/log", "cd /var/log", "mv /var/log", "ls /var/log"], correct: 1 },
    { id: "linux-ls", question: "隠しファイルを含めて一覧を表示するコマンドはどれですか？", options: ["ls -a", "pwd -a", "cat -a", "show -hidden"], correct: 0 },
    { id: "linux-mkdir", question: "新しいディレクトリ reports を作るコマンドはどれですか？", options: ["newdir reports", "touch reports", "mkdir reports", "mkfile reports"], correct: 2 },
    { id: "linux-rm", question: "ファイル temp.txt を削除するコマンドはどれですか？", options: ["rm temp.txt", "delete temp.txt", "rmdir temp.txt", "erase -dir temp.txt"], correct: 0 },
    { id: "linux-cp-mv", question: "ファイルをコピーするコマンドと、名前や場所を移動するコマンドの組み合わせはどれですか？", options: ["mv と cp", "cp と mv", "cat と grep", "ls と pwd"], correct: 1 },
    { id: "linux-cat", question: "テキストファイルの内容を端末に表示する基本的なコマンドはどれですか？", options: ["cat", "pwd", "chmod", "mkdir"], correct: 0 },
    { id: "linux-grep", question: "ログファイルから 'ERROR' を含む行を探すコマンドはどれですか？", options: ["find ERROR app.log", "grep ERROR app.log", "cat ERROR app.log", "ls ERROR app.log"], correct: 1 },
    { id: "linux-chmod", question: "script.sh に所有者の実行権限を追加するコマンドはどれですか？", options: ["chmod u+x script.sh", "chown u+x script.sh", "cp +x script.sh", "grep +x script.sh"], correct: 0 },
    { id: "linux-process", question: "実行中のプロセスを一覧表示する代表的なコマンドはどれですか？", options: ["ps", "pwd", "mkdir", "chmod"], correct: 0 },
  ],
};

export function calculateQuizResult(
  questions: readonly QuizQuestion[],
  answers: readonly (number | null | undefined)[],
): QuizResult {
  const correctCount = questions.reduce(
    (count, question, index) => count + (answers[index] === question.correct ? 1 : 0),
    0,
  );
  const totalQuestions = questions.length;

  return {
    correctCount,
    totalQuestions,
    accuracy: totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100),
  };
}
