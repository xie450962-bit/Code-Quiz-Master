export const TYPING_DURATION_SECONDS = 180;

export type TypingGenre = string;

export type TypingPrompt = {
  id: string;
  genre: TypingGenre;
  text: string;
};

export const TYPING_PROMPTS: TypingPrompt[] = [
  { id: "it-1", genre: "IT系", text: "プログラムを変更する前に、現在の動作と変更の目的をチームのメンバーへ共有しましょう。" },
  { id: "general-1", genre: "一般系", text: "朝の時間に今日取り組むことを整理しておくと、落ち着いて一日を始めることができます。" },
  { id: "it-2", genre: "IT系", text: "入力された情報をそのまま信頼せず、想定した形式や範囲に収まっているかを確認します。" },
  { id: "general-2", genre: "一般系", text: "相手に何かを依頼するときは、期限と期待する結果を具体的に伝えることが大切です。" },
  { id: "it-3", genre: "IT系", text: "エラーが起きたときは、直前に行った操作と表示された内容を記録して原因を調べます。" },
  { id: "general-3", genre: "一般系", text: "新しいことを学ぶときは、小さな目標を決めて少しずつ続けると知識が身につきます。" },
  { id: "it-4", genre: "IT系", text: "読みやすい名前を付けると、プログラムの意図が伝わり、後から修正するときにも役立ちます。" },
  { id: "general-4", genre: "一般系", text: "会議の内容を簡潔にまとめて共有すると、参加できなかった人にも決定事項が伝わります。" },
  { id: "it-5", genre: "IT系", text: "変更を小さな単位に分けて確認すると、問題が起きた場所を見つけやすくなります。" },
  { id: "general-5", genre: "一般系", text: "作業の合間に短い休憩を取ることで、集中力を保ちやすくなり、見落としも減らせます。" },
  { id: "it-6", genre: "IT系", text: "利用者の立場で画面を操作し、説明がなくても次に何をすればよいか分かるか確かめます。" },
  { id: "general-6", genre: "一般系", text: "分からないことを質問するときは、自分で確認した内容も合わせて伝えると話が進みます。" },
];

export type TypingInputResult = {
  acceptedText: string;
  correctCharacters: number;
  mistakes: number;
  completed: boolean;
};

export function applyTypingInput(
  targetText: string,
  acceptedText: string,
  candidateText: string,
): TypingInputResult {
  const targetCharacters = Array.from(targetText);
  const acceptedCharacters = Array.from(acceptedText);
  const candidateCharacters = Array.from(candidateText);

  if (
    candidateCharacters.length < acceptedCharacters.length ||
    acceptedCharacters.some((character, index) => candidateCharacters[index] !== character)
  ) {
    return { acceptedText, correctCharacters: 0, mistakes: 0, completed: false };
  }

  let correctCharacters = 0;
  let mistakes = 0;
  const nextCharacters = [...acceptedCharacters];

  for (const character of candidateCharacters.slice(acceptedCharacters.length)) {
    const expected = targetCharacters[nextCharacters.length];
    if (expected === undefined) break;

    if (character === expected) {
      nextCharacters.push(character);
      correctCharacters += 1;
    } else {
      mistakes += 1;
    }
  }

  return {
    acceptedText: nextCharacters.join(""),
    correctCharacters,
    mistakes,
    completed: nextCharacters.length === targetCharacters.length,
  };
}

export function getRemainingSeconds(startedAt: number, now: number): number {
  const elapsedMilliseconds = Math.max(0, now - startedAt);
  return Math.max(
    0,
    Math.ceil((TYPING_DURATION_SECONDS * 1000 - elapsedMilliseconds) / 1000),
  );
}

export function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export type TypingResult = {
  wpm: number;
  accuracy: number;
  mistakes: number;
  score: number;
  correctCharacters: number;
};

export function calculateTypingScore(
  wpm: number,
  accuracy: number,
  mistakes: number,
): number {
  const safeWpm = Number.isFinite(wpm) ? Math.max(0, wpm) : 0;
  const safeAccuracy = Number.isFinite(accuracy)
    ? Math.min(100, Math.max(0, accuracy))
    : 0;
  const safeMistakes = Number.isFinite(mistakes)
    ? Math.max(0, Math.floor(mistakes))
    : 0;
  const speedPoints = (Math.min(safeWpm, 60) / 60) * 40;

  return Math.max(0, Math.round(safeAccuracy * 0.6 + speedPoints - safeMistakes));
}

export function calculateTypingResult(
  correctCharacters: number,
  mistakes: number,
  elapsedMilliseconds: number,
): TypingResult {
  const safeCorrectCharacters = Math.max(0, Math.floor(correctCharacters));
  const safeMistakes = Math.max(0, Math.floor(mistakes));
  const safeElapsedMilliseconds = Number.isFinite(elapsedMilliseconds)
    ? Math.max(1, Math.min(TYPING_DURATION_SECONDS * 1000, elapsedMilliseconds))
    : 1;
  const wpm = Math.round(
    safeCorrectCharacters / 5 / (safeElapsedMilliseconds / 60_000),
  );
  const attempts = safeCorrectCharacters + safeMistakes;
  const accuracy = attempts === 0
    ? 0
    : Math.round((safeCorrectCharacters / attempts) * 100);

  return {
    wpm,
    accuracy,
    mistakes: safeMistakes,
    score: calculateTypingScore(wpm, accuracy, safeMistakes),
    correctCharacters: safeCorrectCharacters,
  };
}
