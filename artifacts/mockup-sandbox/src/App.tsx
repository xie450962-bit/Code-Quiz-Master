import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type ComponentType,
  type ReactNode,
} from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";
import {
  applyTypingInput,
  calculateTypingResult,
  formatRemainingTime,
  getRemainingSeconds,
  TYPING_DURATION_SECONDS,
  TYPING_PROMPTS,
  type TypingResult,
} from "./typingGame";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;
type Game = "typing" | "sql" | "linux";
type Screen =
  | "user-selection"
  | "home"
  | "typing"
  | "typing-result"
  | "sql"
  | "sql-result"
  | "linux"
  | "linux-result";

type User = {
  name: string;
  role: string;
  initials: string;
  color: string;
};

type GameResult = {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  accuracy: number;
  summary: string;
};

const USERS: User[] = [
  { name: "山田 太郎", role: "新入社員", initials: "YT", color: "blue" },
  { name: "佐藤 花子", role: "新入社員", initials: "SH", color: "purple" },
  { name: "鈴木 一郎", role: "新入社員", initials: "SI", color: "green" },
];

const GAMES: Array<{
  id: Game;
  label: string;
  description: string;
  detail: string;
  icon: string;
  color: string;
}> = [
  {
    id: "typing",
    label: "Typing",
    description: "コード入力の基礎を身につける",
    detail: "お題の文章を正確に入力します",
    icon: "⌨",
    color: "blue",
  },
  {
    id: "sql",
    label: "SQL",
    description: "データベース操作の基礎を学ぶ",
    detail: "SQLに関する問題に答えます",
    icon: "▤",
    color: "purple",
  },
  {
    id: "linux",
    label: "Linux",
    description: "Linuxコマンドの知識を確認する",
    detail: "コマンドに関する問題に答えます",
    icon: ">_",
    color: "green",
  },
];

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);
    async function loadComponent(): Promise<void> {
      const loader = modules[`./components/mockups/${componentPath}.tsx`];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }
      try {
        const mod = await loader();
        if (!cancelled) {
          const name = componentPath.split("/").pop()!;
          const comp = _resolveComponent(mod, name);
          if (!comp) setError(`No exported React component found in ${componentPath}.tsx`);
          else setComponent(() => comp);
        }
      } catch (e) {
        if (!cancelled) setError(`Failed to load preview.\n${e instanceof Error ? e.message : String(e)}`);
      }
    }
    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) return <pre className="preview-error">{error}</pre>;
  return Component ? <Component /> : null;
}

function getPreviewPath(): string | null {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname;
  const local = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`app-logo ${compact ? "app-logo-compact" : ""}`}>
      <span className="app-logo-mark">⌁</span>
      {!compact && <span>CodeStart</span>}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "text";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      className={`app-button app-button-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function UserSelection({ onSelect }: { onSelect: (user: User) => void }) {
  return (
    <main className="selection-page">
      <div className="selection-panel">
        <Logo />
        <div className="selection-heading">
          <span className="eyebrow">INTERNAL LEARNING</span>
          <h1>誰が学習しますか？</h1>
          <p>ユーザーを選択して、学習を始めましょう。</p>
        </div>
        <div className="user-list" role="list">
          {USERS.map((user) => (
            <button
              className="user-card"
              key={user.name}
              onClick={() => onSelect(user)}
              type="button"
            >
              <span className={`avatar avatar-${user.color}`}>{user.initials}</span>
              <span className="user-card-copy">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </span>
              <span className="arrow">→</span>
            </button>
          ))}
        </div>
        <p className="muted-note">※ デモ用のユーザー選択を使用します</p>
      </div>
    </main>
  );
}

function AppHeader({
  user,
  onChangeUser,
}: {
  user: User;
  onChangeUser: () => void;
}) {
  return (
    <header className="app-header">
      <Logo />
      <button className="current-user" type="button" onClick={onChangeUser}>
        <span className={`avatar avatar-${user.color} avatar-small`}>{user.initials}</span>
        <span>{user.name}</span>
        <span className="current-user-chevron">⌄</span>
      </button>
    </header>
  );
}

function Home({
  user,
  onChangeUser,
  onStart,
}: {
  user: User;
  onChangeUser: () => void;
  onStart: (game: Game) => void;
}) {
  return (
    <div className="app-shell">
      <AppHeader user={user} onChangeUser={onChangeUser} />
      <main className="home-content">
        <div className="home-intro">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>今日も学習を始めましょう。</h1>
          <p>ゲームを選択して、ITの基礎スキルを身につけましょう。</p>
        </div>
        <section className="game-grid" aria-label="ゲームを選択">
          {GAMES.map((game) => (
            <button
              className={`game-card game-card-${game.color}`}
              key={game.id}
              onClick={() => onStart(game.id)}
              type="button"
            >
              <span className={`game-icon game-icon-${game.color}`}>{game.icon}</span>
              <span className="game-card-copy">
                <span className="game-card-label">{game.label}</span>
                <span className="game-card-description">{game.description}</span>
                <span className="game-card-detail">{game.detail}</span>
              </span>
              <span className="game-card-arrow">→</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

function GameHeader({
  game,
  onHome,
}: {
  game: Game;
  onHome: () => void;
}) {
  const item = GAMES.find((candidate) => candidate.id === game)!;
  return (
    <div className="game-topbar">
      <button className="back-link" onClick={onHome} type="button">← HOME</button>
      <div className="game-progress">
        <span className={`game-dot game-dot-${item.color}`}>{item.icon}</span>
        <strong>{item.label}</strong>
        <span className="progress-divider">/</span>
        <span>Practice</span>
      </div>
      <span className="phase-label">PRACTICE</span>
    </div>
  );
}

function GameLayout({
  game,
  onHome,
  children,
}: {
  game: Game;
  onHome: () => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <div className="game-page">
        <GameHeader game={game} onHome={onHome} />
        <main className="game-content">{children}</main>
      </div>
    </div>
  );
}

function TypingScreen({
  onResult,
  onHome,
}: {
  onResult: (result: TypingResult) => void;
  onHome: () => void;
}) {
  const [startedAt] = useState(() => Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState(TYPING_DURATION_SECONDS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [completedPrompts, setCompletedPrompts] = useState(0);
  const [acceptedInput, setAcceptedInput] = useState("");
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const correctCharactersRef = useRef(0);
  const mistakesRef = useRef(0);
  const acceptedInputRef = useRef("");
  const inputElementRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const compositionValueRef = useRef<string | null>(null);
  const isFinishedRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const currentPrompt = TYPING_PROMPTS[promptIndex]!;
  const deadline = startedAt + TYPING_DURATION_SECONDS * 1000;

  const finishGame = useCallback((finishedAt: number) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onResultRef.current(
      calculateTypingResult(
        correctCharactersRef.current,
        mistakesRef.current,
        finishedAt - startedAt,
      ),
    );
  }, [startedAt]);

  const updateTimer = useCallback(() => {
    const remaining = getRemainingSeconds(startedAt, Date.now());
    setRemainingSeconds(remaining);
    if (remaining === 0) finishGame(deadline);
  }, [deadline, finishGame, startedAt]);

  useEffect(() => {
    const interval = window.setInterval(updateTimer, 200);
    const deadlineTimer = window.setTimeout(updateTimer, TYPING_DURATION_SECONDS * 1000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(deadlineTimer);
    };
  }, [updateTimer]);

  const acceptCandidate = (candidateText: string) => {
    if (isFinishedRef.current) return;
    if (Date.now() >= deadline) {
      setRemainingSeconds(0);
      finishGame(deadline);
      return;
    }

    const inputResult = applyTypingInput(
      currentPrompt.text,
      acceptedInputRef.current,
      candidateText,
    );
    acceptedInputRef.current = inputResult.acceptedText;
    setAcceptedInput(inputResult.acceptedText);
    if (inputElementRef.current) {
      inputElementRef.current.value = inputResult.acceptedText;
    }

    correctCharactersRef.current += inputResult.correctCharacters;
    mistakesRef.current += inputResult.mistakes;
    setCorrectCharacters(correctCharactersRef.current);
    setMistakes(mistakesRef.current);

    if (inputResult.completed) {
      acceptedInputRef.current = "";
      setAcceptedInput("");
      if (inputElementRef.current) inputElementRef.current.value = "";
      setPromptIndex((index) => (index + 1) % TYPING_PROMPTS.length);
      setCompletedPrompts((count) => count + 1);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const candidate = event.currentTarget.value;
    if (isComposingRef.current) return;
    if (compositionValueRef.current === candidate) {
      compositionValueRef.current = null;
      return;
    }
    compositionValueRef.current = null;
    acceptCandidate(candidate);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const candidate = event.currentTarget.value;
    compositionValueRef.current = candidate;
    acceptCandidate(candidate);
  };

  return (
    <GameLayout game="typing" onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">TYPING PRACTICE</span>
        <h1>表示された文章を入力しましょう。</h1>
        <p>正しい文字を入力すると、次のお題へ進みます。制限時間は三分です。</p>
      </div>
      <section className="typing-card">
        <div className="typing-card-meta">
          <span>残り時間</span>
          <strong className="typing-timer" role="timer">{formatRemainingTime(remainingSeconds)}</strong>
        </div>
        <div className="typing-prompt-meta">
          <span>{currentPrompt.genre}</span>
          <span>完了したお題：{completedPrompts}</span>
        </div>
        <p className="typing-prompt">{currentPrompt.text}</p>
        <input
          ref={inputElementRef}
          type="text"
          lang="ja"
          className="typing-input"
          aria-label="表示された文章の入力欄"
          placeholder="日本語で入力してください"
          onChange={handleInputChange}
          onCompositionStart={() => { isComposingRef.current = true; }}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={(event) => {
            if (isComposingRef.current) return;
            if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
              event.preventDefault();
            }
          }}
          autoFocus
        />
        <div className="game-action-row">
          <span className="helper-text">
            入力：{Array.from(acceptedInput).length} / {Array.from(currentPrompt.text).length}文字
            {"　"}ミス：{mistakes}
            {"　"}正しい文字：{correctCharacters}
          </span>
          <span className="helper-text">三分が経過すると結果へ移動します</span>
        </div>
      </section>
    </GameLayout>
  );
}

const QUIZ_QUESTIONS: Record<"sql" | "linux", Array<{
  question: string;
  options: string[];
  correct: number;
}>> = {
  sql: [
    {
      question: "ユーザー一覧を取得するSQLとして正しいものはどれですか？",
      options: ["SELECT * FROM users;", "SELECT users FROM *;", "GET * FROM users;", "READ users;"],
      correct: 0,
    },
    {
      question: "結果を名前の昇順に並べ替える句はどれですか？",
      options: ["SORT name UP", "ORDER BY name ASC", "GROUP name ASC", "ARRANGE BY name"],
      correct: 1,
    },
    {
      question: "重複を除いた値を取得するキーワードはどれですか？",
      options: ["UNIQUE ROW", "DISTINCT", "ONLY", "DEDUP"],
      correct: 1,
    },
    {
      question: "条件に一致する行だけを絞り込む句はどれですか？",
      options: ["HAVING ONLY", "WHERE", "FILTER BY", "MATCH"],
      correct: 1,
    },
    {
      question: "テーブルの行数を数えるSQLとして正しいものはどれですか？",
      options: ["SELECT ROWS(*) FROM users;", "SELECT COUNT(*) FROM users;", "COUNT users;", "SELECT TOTAL users;"],
      correct: 1,
    },
  ],
  linux: [
    {
      question: "現在のディレクトリを表示するLinuxコマンドはどれですか？",
      options: ["pwd", "cd", "ls", "mkdir"],
      correct: 0,
    },
    {
      question: "ファイルやディレクトリの一覧を表示するコマンドはどれですか？",
      options: ["list", "ls", "dir-show", "files"],
      correct: 1,
    },
    {
      question: "ファイルに実行権限を追加するコマンドはどれですか？",
      options: ["chown +x script.sh", "chmod +x script.sh", "exec script.sh", "sudo script.sh"],
      correct: 1,
    },
    {
      question: "ファイルの末尾20行を表示するコマンドはどれですか？",
      options: ["head -n 20 file.log", "tail -n 20 file.log", "last 20 file.log", "read --tail file.log"],
      correct: 1,
    },
    {
      question: "コマンドの標準出力を別のコマンドへ渡す記号はどれですか？",
      options: [">", "|", "&&&", "->"],
      correct: 1,
    },
  ],
};

function QuizScreen({
  game,
  onResult,
  onHome,
}: {
  game: "sql" | "linux";
  onResult: (result: GameResult) => void;
  onHome: () => void;
}) {
  const isSql = game === "sql";
  const questions = QUIZ_QUESTIONS[game];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== null;

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    const nextScore = score + (selectedAnswer === currentQuestion.correct ? 1 : 0);

    if (currentQuestionIndex === questions.length - 1) {
      const accuracy = Math.round((nextScore / questions.length) * 100);
      onResult({
        primaryLabel: "スコア",
        primaryValue: `${nextScore}/${questions.length}`,
        secondaryLabel: "正解数",
        secondaryValue: `${nextScore}問`,
        accuracy,
        summary: accuracy === 100
          ? "全問正解です。すばらしい結果です。"
          : "回答を完了しました。間違えた問題も復習してみましょう。",
      });
      return;
    }

    setScore(nextScore);
    setCurrentQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">{isSql ? "SQL QUIZ" : "LINUX QUIZ"}</span>
        <h1>{isSql ? "SQLの基礎を確認しましょう。" : "Linuxコマンドを確認しましょう。"}</h1>
        <p>全5問の選択式クイズです。回答すると、その場で正誤を確認できます。</p>
      </div>
      <section className="quiz-card">
        <div className="quiz-card-top">
          <span>QUESTION {String(currentQuestionIndex + 1).padStart(2, "0")} / {questions.length}</span>
          <span className="quiz-status">
            {hasAnswered
              ? selectedAnswer === currentQuestion.correct ? "正解" : "不正解"
              : "未回答"}
          </span>
        </div>
        <h2>{currentQuestion.question}</h2>
        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = currentQuestion.correct === index;
            return (
            <button
              className={`quiz-option ${hasAnswered && isCorrect ? "quiz-option-correct" : ""} ${hasAnswered && isSelected && !isCorrect ? "quiz-option-wrong" : ""}`}
              key={option}
              type="button"
              onClick={() => handleAnswer(index)}
              disabled={hasAnswered}
            >
              <span className="option-key">{String.fromCharCode(65 + index)}</span>
              <code>{option}</code>
            </button>
            );
          })}
        </div>
        <div className="game-action-row">
          <span className="helper-text">
            {hasAnswered
              ? selectedAnswer === currentQuestion.correct ? "正解です。" : "正しい選択肢を確認しましょう。"
              : "選択肢を1つ選んでください"}
          </span>
          <Button onClick={handleNext} disabled={!hasAnswered}>
            {currentQuestionIndex === questions.length - 1 ? "結果を見る →" : "次の問題 →"}
          </Button>
        </div>
      </section>
    </GameLayout>
  );
}

function ResultScreen({
  game,
  result,
  onAgain,
  onHome,
}: {
  game: Game;
  result: GameResult | TypingResult;
  onAgain: () => void;
  onHome: () => void;
}) {
  const item = GAMES.find((candidate) => candidate.id === game)!;
  const typingResult = "wpm" in result ? result : null;
  const gameResult = "primaryValue" in result ? result : null;
  const metrics = typingResult
    ? [
        ["WPM", String(typingResult.wpm), "一分あたりの入力速度"],
        ["正確率", String(typingResult.accuracy) + "%", "正しい文字の割合"],
        ["ミス数", String(typingResult.mistakes), "誤入力した文字数"],
        ["スコア", String(typingResult.score) + "点", "速度・正確率・ミス数から計算"],
      ]
    : [
        ["今回", gameResult!.primaryValue, gameResult!.primaryLabel],
        ["正確率", String(gameResult!.accuracy) + "%", "今回の正解率"],
        [gameResult!.secondaryLabel, gameResult!.secondaryValue, "今回の結果"],
      ];

  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="result-heading">
        <span className={"result-check result-check-" + item.color}>✓</span>
        <span className="eyebrow">{item.label.toUpperCase()} RESULT</span>
        <h1>おつかれさまでした。</h1>
        <p>{typingResult ? "今回のタイピング結果です。" : gameResult!.summary}</p>
      </div>
      <section className="result-card">
        <div className={typingResult ? "result-metrics result-metrics-typing" : "result-metrics"}>
          {metrics.map(([label, value, note]) => (
            <div className="result-metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
        {typingResult && (
          <div className="result-comparison">
            <h2>スコア比較</h2>
            <div className="result-comparison-metrics">
              {[
                ["今回", String(typingResult.score) + "点", "今回のスコア"],
                ["前回", "—", "記録はまだありません"],
                ["自己ベスト", "—", "記録はまだありません"],
              ].map(([label, value, note]) => (
                <div className="result-metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{note}</small>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="result-notice">
          <span>i</span>
          <p>{typingResult ? "前回と自己ベストの保存は Phase 4 で実装します。" : "この結果は今回のプレイに基づいて計算されています。"}</p>
        </div>
        <div className="result-actions">
          <Button variant="secondary" onClick={onHome}>HOMEへ戻る</Button>
          <Button onClick={onAgain}>もう一度プレイ →</Button>
        </div>
      </section>
    </GameLayout>
  );
}

function LearningApp() {
  const [screen, setScreen] = useState<Screen>("user-selection");
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<GameResult | TypingResult | null>(null);

  const chooseUser = (selected: User) => {
    setUser(selected);
    setScreen("home");
  };

  if (!user || screen === "user-selection") return <UserSelection onSelect={chooseUser} />;

  const startGame = (game: Game) => {
    setResult(null);
    setScreen(game);
  };
  const showResult = (game: Game, gameResult: GameResult | TypingResult) => {
    setResult(gameResult);
    setScreen((game + "-result") as Screen);
  };
  const resultGame = screen.endsWith("-result") ? screen.replace("-result", "") as Game : null;

  if (screen === "home") {
    return <Home user={user} onChangeUser={() => setScreen("user-selection")} onStart={startGame} />;
  }
  if (screen === "typing") return <TypingScreen onResult={(typingResult) => showResult("typing", typingResult)} onHome={() => setScreen("home")} />;
  if (screen === "sql") return <QuizScreen game="sql" onResult={(gameResult) => showResult("sql", gameResult)} onHome={() => setScreen("home")} />;
  if (screen === "linux") return <QuizScreen game="linux" onResult={(gameResult) => showResult("linux", gameResult)} onHome={() => setScreen("home")} />;
  if (resultGame && result) return <ResultScreen game={resultGame} result={result} onAgain={() => startGame(resultGame)} onHome={() => setScreen("home")} />;
  return null;
}

function App() {
  const previewPath = getPreviewPath();
  return previewPath ? (
    <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />
  ) : (
    <LearningApp />
  );
}

export default App;
