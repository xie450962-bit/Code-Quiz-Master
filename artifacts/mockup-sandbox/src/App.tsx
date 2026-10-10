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
  calculateQuizResult,
  type QuizResult,
  type QuizQuestion,
} from "./quizGame";
import {
  applyTypingInput,
  calculateTypingResult,
  formatRemainingTime,
  getRemainingSeconds,
  TYPING_DURATION_SECONDS,
  type TypingPrompt,
  type TypingResult,
} from "./typingGame";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;
type Game = "typing" | "sql" | "linux";
type Screen =
  | "user-selection"
  | "home"
  | "typing-setup"
  | "sql-setup"
  | "linux-setup"
  | "typing"
  | "typing-result"
  | "sql"
  | "sql-result"
  | "linux"
  | "linux-result";

type User = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
};

const USERS: User[] = [
  { id: "user-yamada", name: "山田 太郎", role: "新入社員", initials: "YT", color: "blue" },
  { id: "user-sato", name: "佐藤 花子", role: "新入社員", initials: "SH", color: "purple" },
  { id: "user-suzuki", name: "鈴木 一郎", role: "新入社員", initials: "SI", color: "green" },
];

type StoredResult = {
  id: number;
  userId: string;
  gameType: Game;
  wpm: number | null;
  accuracy: number;
  errors: number | null;
  score: number;
  totalQuestions: number | null;
  correctAnswers: number | null;
  playedAt: string;
};
type ResultComparison = { current: StoredResult; previous: StoredResult | null; best: StoredResult };
type ResultView = { comparison: ResultComparison; saveError: string | null };

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

type GameContentOptions = {
  typingCategories: string[];
  quizDifficulties: Array<{ gameType: string; difficulty: string }>;
};

function GameSetup({
  game,
  options,
  loading,
  error,
  onStart,
  onHome,
}: {
  game: Game;
  options: GameContentOptions | null;
  loading: boolean;
  error: string | null;
  onStart: (game: Game, choice: string) => void;
  onHome: () => void;
}) {
  const choices = game === "typing"
    ? options?.typingCategories ?? []
    : options?.quizDifficulties.filter((item) => item.gameType === game).map((item) => item.difficulty) ?? [];
  const [choice, setChoice] = useState("");
  useEffect(() => setChoice(choices[0] ?? ""), [game, choices.join("|")]);
  const label = game === "typing" ? "カテゴリー" : "難易度";
  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">{game === "typing" ? "TYPING PRACTICE" : `${game.toUpperCase()} QUIZ`}</span>
        <h1>{game === "typing" ? "カテゴリーを選びましょう。" : "難易度を選びましょう。"}</h1>
        <p>{game === "typing" ? "選んだカテゴリーの文章が出題されます。" : "選んだ難易度の問題が出題されます。"}</p>
      </div>
      <section className="quiz-card setup-card">
        <span className="setup-label">{label}</span>
        {error && <p className="setup-error" role="alert">{error}</p>}
        {loading ? <p>選択肢を読み込んでいます…</p> : choices.length ? (
          <div className="setup-options">
            {choices.map((item) => (
              <button className={`quiz-option ${choice === item ? "quiz-option-selected" : ""}`} key={item} type="button" aria-pressed={choice === item} onClick={() => setChoice(item)}>
                <span className="option-key">{choice === item ? "✓" : "•"}</span><strong>{item}</strong>
              </button>
            ))}
          </div>
        ) : <p role="alert">選択できる項目がありません。DBに問題データを登録してください。</p>}
        <div className="game-action-row">
          <span className="helper-text">問題はゲーム開始時にDBから取得します。</span>
          <Button onClick={() => onStart(game, choice)} disabled={!choice || loading}>ゲーム開始 →</Button>
        </div>
      </section>
    </GameLayout>
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
  prompts,
  onResult,
  onHome,
}: {
  prompts: TypingPrompt[];
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

  const currentPrompt = prompts[promptIndex]!;
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
      setPromptIndex((index) => (index + 1) % prompts.length);
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

function QuizScreen({
  game,
  questions,
  onResult,
  onHome,
}: {
  game: "sql" | "linux";
  questions: QuizQuestion[];
  onResult: (result: QuizResult) => void;
  onHome: () => void;
}) {
  const isSql = game === "sql";
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const isFinishedRef = useRef(false);
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== null;

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null || isFinishedRef.current) return;
    const nextAnswers = [...answers, selectedAnswer];

    if (currentQuestionIndex === questions.length - 1) {
      isFinishedRef.current = true;
      onResult(calculateQuizResult(questions, nextAnswers));
      return;
    }

    setAnswers(nextAnswers);
    setCurrentQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">{isSql ? "SQL QUIZ" : "LINUX QUIZ"}</span>
        <h1>{isSql ? "SQLの基礎を確認しましょう。" : "Linuxコマンドを確認しましょう。"}</h1>
        <p>全{questions.length}問の選択式クイズです。回答後に正誤を確認して次の問題へ進みます。</p>
      </div>
      <section className="quiz-card">
        <div className="quiz-card-top">
          <span>問題 {currentQuestionIndex + 1} / {questions.length}</span>
          <span className="quiz-status" aria-live="polite">
            {hasAnswered
              ? selectedAnswer === currentQuestion.correct ? "正解" : "不正解"
              : "未回答"}
          </span>
        </div>
        <progress
          className="quiz-progress"
          aria-label="クイズの進捗"
          max={questions.length}
          value={currentQuestionIndex + 1}
        />
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
              aria-pressed={isSelected}
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
          <span className="helper-text" aria-live="polite">
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
  resultView,
  onAgain,
  onHome,
}: {
  game: Game;
  result: QuizResult | TypingResult;
  resultView: ResultView;
  onAgain: () => void;
  onHome: () => void;
}) {
  const item = GAMES.find((candidate) => candidate.id === game)!;
  const typingResult = "wpm" in result ? result : null;
  const quizResult = "correctCount" in result ? result : null;
  const comparisonRows = [
    ["今回", resultView.comparison.current],
    ["前回", resultView.comparison.previous],
    ["自己ベスト", resultView.comparison.best],
  ] as const;

  const describeResult = (record: StoredResult | null) => {
    if (!record) return "記録はありません";
    return typingResult
      ? `WPM ${record.wpm ?? 0} ・ 正確率 ${record.accuracy}% ・ ミス ${record.errors ?? 0} ・ スコア ${record.score}点`
      : `${record.correctAnswers ?? 0} / ${record.totalQuestions ?? 10}問 ・ 正確率 ${record.accuracy}%`;
  };

  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="result-heading">
        <span className={"result-check result-check-" + item.color}>✓</span>
        <span className="eyebrow">{item.label.toUpperCase()} RESULT</span>
        <h1>おつかれさまでした。</h1>
        <p>{typingResult ? "今回のタイピング結果です。" : `全${quizResult!.totalQuestions}問の回答が完了しました。`}</p>
      </div>
      <section className="result-card">
        <div className="result-comparison">
          <h2>今回・前回・自己ベスト</h2>
          <div className="result-comparison-metrics">
            {comparisonRows.map(([label, record]) => (
              <div className="result-metric" key={label}>
                <span>{label}</span>
                <strong>{describeResult(record)}</strong>
                <small>{record ? new Date(record.playedAt).toLocaleString("ja-JP") : "前回の記録はありません"}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="result-notice">
          <span>i</span>
          <p>{resultView.saveError ?? "結果を保存しました。"}</p>
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
  const [result, setResult] = useState<QuizResult | TypingResult | null>(null);
  const [resultView, setResultView] = useState<ResultView | null>(null);
  const [contentOptions, setContentOptions] = useState<GameContentOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loadingGame, setLoadingGame] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [typingPrompts, setTypingPrompts] = useState<TypingPrompt[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeChoice, setActiveChoice] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/game-content/options")
      .then(async (response) => {
        if (!response.ok) throw new Error(`選択肢APIが ${response.status} を返しました`);
        return response.json() as Promise<GameContentOptions>;
      })
      .then((options) => { if (!cancelled) setContentOptions(options); })
      .catch((error: unknown) => { if (!cancelled) setSetupError(`出題データを読み込めませんでした。${error instanceof Error ? ` (${error.message})` : ""}`); })
      .finally(() => { if (!cancelled) setOptionsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const chooseUser = (selected: User) => {
    setUser(selected);
    setScreen("home");
  };

  if (!user || screen === "user-selection") return <UserSelection onSelect={chooseUser} />;

  const startGame = async (game: Game, choice: string) => {
    setResult(null);
    setResultView(null);
    setSetupError(null);
    setLoadingGame(true);
    setScreen(`${game}-setup` as Screen);
    try {
      const query = game === "typing"
        ? `category=${encodeURIComponent(choice)}`
        : `gameType=${game}&difficulty=${encodeURIComponent(choice)}`;
      const path = game === "typing" ? "typing" : "quizzes";
      const response = await fetch(`/api/game-content/${path}?${query}`, { signal: AbortSignal.timeout(10000) });
      const data = await response.json() as { error?: string; prompts?: Array<TypingPrompt & { category?: string }>; questions?: QuizQuestion[] };
      if (!response.ok) throw new Error(data.error ?? `出題APIが ${response.status} を返しました`);
      if (game === "typing") {
        const prompts = (data.prompts ?? []).map((prompt) => ({ ...prompt, genre: prompt.category ?? choice }));
        if (!prompts.length) throw new Error("該当カテゴリーの文章がありません。");
        setTypingPrompts(prompts);
      } else {
        if (!data.questions?.length) throw new Error("選択した難易度の問題がありません。");
        setQuizQuestions(data.questions);
      }
      setActiveChoice(choice);
      setScreen(game);
    } catch (error) {
      setSetupError(`問題を読み込めませんでした。${error instanceof Error ? ` (${error.message})` : ""}`);
    } finally {
      setLoadingGame(false);
    }
  };
  const showResult = async (game: Game, gameResult: QuizResult | TypingResult) => {
    setResult(gameResult);
    const payload = game === "typing" && "wpm" in gameResult
      ? { userId: user.id, gameType: game, wpm: gameResult.wpm, accuracy: gameResult.accuracy, errors: gameResult.mistakes, score: gameResult.score }
      : { userId: user.id, gameType: game, accuracy: (gameResult as QuizResult).accuracy, score: (gameResult as QuizResult).correctCount, totalQuestions: (gameResult as QuizResult).totalQuestions, correctAnswers: (gameResult as QuizResult).correctCount };
    let view: ResultView;
    try {
      const response = await fetch("/api/game-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`保存APIが ${response.status} を返しました`);
      view = { comparison: await response.json() as ResultComparison, saveError: null };
    } catch (error) {
      const now = new Date().toISOString();
      const current: StoredResult = {
        id: 0, userId: user.id, gameType: game,
        wpm: "wpm" in gameResult ? gameResult.wpm : null,
        accuracy: gameResult.accuracy,
        errors: "mistakes" in gameResult ? gameResult.mistakes : null,
        score: "wpm" in gameResult ? gameResult.score : gameResult.correctCount,
        totalQuestions: "correctCount" in gameResult ? gameResult.totalQuestions : null,
        correctAnswers: "correctCount" in gameResult ? gameResult.correctCount : null,
        playedAt: now,
      };
      view = { comparison: { current, previous: null, best: current }, saveError: `結果を保存できませんでした。DB/APIの設定を確認してください。(${error instanceof Error ? error.message : String(error)})` };
    }
    setResultView(view);
    setScreen((game + "-result") as Screen);
  };
  const resultGame = screen.endsWith("-result") ? screen.replace("-result", "") as Game : null;

  if (screen === "home") {
    return <Home user={user} onChangeUser={() => setScreen("user-selection")} onStart={(game) => { setSetupError(null); setScreen(`${game}-setup` as Screen); }} />;
  }
  if (screen.endsWith("-setup")) {
    const game = screen.replace("-setup", "") as Game;
    return <GameSetup game={game} options={contentOptions} loading={optionsLoading || loadingGame} onStart={startGame} onHome={() => setScreen("home")} error={setupError} />;
  }
  if (screen === "typing") return <TypingScreen prompts={typingPrompts} onResult={(typingResult) => showResult("typing", typingResult)} onHome={() => setScreen("home")} />;
  if (screen === "sql") return <QuizScreen game="sql" questions={quizQuestions} onResult={(gameResult) => showResult("sql", gameResult)} onHome={() => setScreen("home")} />;
  if (screen === "linux") return <QuizScreen game="linux" questions={quizQuestions} onResult={(gameResult) => showResult("linux", gameResult)} onHome={() => setScreen("home")} />;
  if (resultGame && result && resultView) return <ResultScreen game={resultGame} result={result} resultView={resultView} onAgain={() => startGame(resultGame, activeChoice)} onHome={() => setScreen("home")} />;
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
