import { useEffect, useState, type ComponentType, type ReactNode } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

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
        <p className="muted-note">※ Phase 1では仮のユーザー選択を使用します</p>
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
      <span className="phase-label">PHASE 1</span>
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

function TypingScreen({ onResult, onHome }: { onResult: () => void; onHome: () => void }) {
  return (
    <GameLayout game="typing" onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">TYPING PRACTICE</span>
        <h1>コードを正確に入力しましょう。</h1>
        <p>表示された文章を入力する練習です。タイマーと判定は次のPhaseで実装します。</p>
      </div>
      <section className="typing-card">
        <div className="typing-card-meta"><span>QUESTION 01</span><span>準備中</span></div>
        <p className="typing-prompt">
          const greeting = &quot;Hello, new engineer!&quot;;
        </p>
        <textarea
          className="typing-input"
          aria-label="タイピング入力欄"
          placeholder="ここに入力してください..."
        />
        <div className="game-action-row">
          <span className="helper-text">入力内容はまだ判定されません</span>
          <Button onClick={onResult}>結果を見る →</Button>
        </div>
      </section>
    </GameLayout>
  );
}

const QUIZ_OPTIONS = [
  "SELECT * FROM users;",
  "SELECT users FROM *;",
  "GET * FROM users;",
  "READ users;",
];

function QuizScreen({
  game,
  onResult,
  onHome,
}: {
  game: "sql" | "linux";
  onResult: () => void;
  onHome: () => void;
}) {
  const isSql = game === "sql";
  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="game-heading">
        <span className="eyebrow">{isSql ? "SQL QUIZ" : "LINUX QUIZ"}</span>
        <h1>{isSql ? "SQLの基礎を確認しましょう。" : "Linuxコマンドを確認しましょう。"}</h1>
        <p>問題と選択肢のレイアウトです。正誤判定は次のPhaseで実装します。</p>
      </div>
      <section className="quiz-card">
        <div className="quiz-card-top"><span>QUESTION 01 / 05</span><span className="quiz-status">未回答</span></div>
        <h2>
          {isSql
            ? "ユーザー一覧を取得するSQLとして正しいものはどれですか？"
            : "現在のディレクトリを表示するLinuxコマンドはどれですか？"}
        </h2>
        <div className="quiz-options">
          {(isSql ? QUIZ_OPTIONS : ["pwd", "cd", "ls", "mkdir"]).map((option, index) => (
            <button className="quiz-option" key={option} type="button">
              <span className="option-key">{String.fromCharCode(65 + index)}</span>
              <code>{option}</code>
            </button>
          ))}
        </div>
        <div className="game-action-row">
          <span className="helper-text">選択しても正誤判定は行われません</span>
          <Button onClick={onResult}>回答する →</Button>
        </div>
      </section>
    </GameLayout>
  );
}

function ResultScreen({
  game,
  onAgain,
  onHome,
}: {
  game: Game;
  onAgain: () => void;
  onHome: () => void;
}) {
  const item = GAMES.find((candidate) => candidate.id === game)!;
  return (
    <GameLayout game={game} onHome={onHome}>
      <div className="result-heading">
        <span className={`result-check result-check-${item.color}`}>✓</span>
        <span className="eyebrow">{item.label.toUpperCase()} RESULT</span>
        <h1>おつかれさまでした。</h1>
        <p>結果表示のエリアです。Phase 1では仮の値を表示しています。</p>
      </div>
      <section className="result-card">
        <div className="result-metrics">
          {[
            ["今回", "—", "未実装"],
            ["前回", "—", "未実装"],
            ["自己ベスト", "—", "未実装"],
          ].map(([label, value, note]) => (
            <div className="result-metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
        <div className="result-notice">
          <span>i</span>
          <p>スコア計算と履歴保存は今後のPhaseで実装します。</p>
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

  const chooseUser = (selected: User) => {
    setUser(selected);
    setScreen("home");
  };

  if (!user || screen === "user-selection") return <UserSelection onSelect={chooseUser} />;

  const startGame = (game: Game) => setScreen(game);
  const showResult = (game: Game) => setScreen(`${game}-result` as Screen);
  const resultGame = screen.endsWith("-result") ? screen.replace("-result", "") as Game : null;

  if (screen === "home") {
    return <Home user={user} onChangeUser={() => setScreen("user-selection")} onStart={startGame} />;
  }
  if (screen === "typing") return <TypingScreen onResult={() => showResult("typing")} onHome={() => setScreen("home")} />;
  if (screen === "sql") return <QuizScreen game="sql" onResult={() => showResult("sql")} onHome={() => setScreen("home")} />;
  if (screen === "linux") return <QuizScreen game="linux" onResult={() => showResult("linux")} onHome={() => setScreen("home")} />;
  if (resultGame) return <ResultScreen game={resultGame} onAgain={() => setScreen(resultGame)} onHome={() => setScreen("home")} />;
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