import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Home,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
  XCircle,
  Frown,
  Smile,
  CloudCheck,
  CloudAlert,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Deck } from "../types/deck";
import { getDeckById } from "../features/decks/services/deckServices";
import {
  getOrCreateDeviceSessionId,
  loadStudyProgress,
  resetStudyProgress,
  saveStudyProgress,
} from "../features/study/services/studyProgressService";
import { StudyDirection, StudyMode } from "../types/studyProgress";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const ROUND_SIZE = 20;
const DEFAULT_TEST_SIZE = 30;

const MODE_LABELS: Record<StudyMode, string> = {
  flashcard: "Flashcards",
  typing: "Typing",
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const levenshteinDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[rows - 1][cols - 1];
};

const shuffleArray = <T,>(values: T[]): T[] => {
  const copy = [...values];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const insertAtRandomPosition = (queue: number[], value: number): number[] => {
  const result = [...queue];
  const index = Math.floor(Math.random() * (result.length + 1));
  result.splice(index, 0, value);
  return result;
};


const isAnswerCorrect = (answer: string, solution: string): boolean => {
  const normalizedAnswer = normalize(answer);
  const normalizedSolution = normalize(solution);

  if (normalizedAnswer === normalizedSolution) {
    return true;
  }

  if (normalizedSolution.length < 5) {
    return false;
  }

  return levenshteinDistance(normalizedAnswer, normalizedSolution) <= 1;
};

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [direction, setDirection] = useState<StudyDirection>("termToAnswer");
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>([]);
  const [roundQueue, setRoundQueue] = useState<number[]>([]);
  const [remainingQueue, setRemainingQueue] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isHydratedFromDb, setIsHydratedFromDb] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [testQuestionCount, setTestQuestionCount] = useState(DEFAULT_TEST_SIZE);
  const [testQueue, setTestQueue] = useState<number[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testCorrectAnswers, setTestCorrectAnswers] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  const currentCardIndex = isTestStarted
    ? (testQueue[testIndex] ?? null)
    : (roundQueue[0] ?? null);
  const currentCard =
    currentCardIndex !== null ? (deck?.cards[currentCardIndex] ?? null) : null;
  const cardsCount = deck?.cards.length ?? 0;
  const isCompleted =
    cardsCount > 0 && roundQueue.length === 0 && remainingQueue.length === 0;

  const promptText =
    direction === "termToAnswer" ? currentCard?.term : currentCard?.answer;
  const solutionText =
    direction === "termToAnswer" ? currentCard?.answer : currentCard?.term;

  const progress =
    cardsCount > 0 ? Math.round((masteredCardIds.length / cardsCount) * 100) : 0;

  const queueStatsText = useMemo(
    () => `${roundQueue.length} aktywnych • ${remainingQueue.length} później`,
    [remainingQueue.length, roundQueue.length],
  );
  const testStatsText = `${Math.min(testIndex + 1, testQueue.length)}/${testQueue.length}`;

  useEffect(() => {
    setSessionId(getOrCreateDeviceSessionId());
  }, []);

  useEffect(() => {
    if (!cardsCount) {
      return;
    }

    setTestQuestionCount(Math.min(DEFAULT_TEST_SIZE, cardsCount));
  }, [cardsCount]);

  useEffect(() => {
    let isMounted = true;

    const loadDeck = async () => {
      if (!deckId) {
        setError("Nie znaleziono identyfikatora talii.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedDeck = await getDeckById(deckId);

        if (!isMounted) {
          return;
        }

        if (!fetchedDeck) {
          setError("Talia nie istnieje lub została usunięta.");
          setDeck(null);
          return;
        }

        setDeck(fetchedDeck);
        setError(null);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "Nieznany błąd.";
        setError(`Nie udało się wczytać talii: ${message}`);
        setDeck(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDeck();

    return () => {
      isMounted = false;
    };
  }, [deckId]);

  useEffect(() => {
    if (!deck || !deck.cards.length || !sessionId) {
      return;
    }

    let isMounted = true;

    const hydrateProgress = async () => {
      const defaultIndexes = deck.cards.map((_, index) => index);
      const fallbackRound = defaultIndexes.slice(0, ROUND_SIZE);
      const fallbackRemaining = defaultIndexes.slice(ROUND_SIZE);

      try {
        const persisted = await loadStudyProgress(deck.id, sessionId);

        if (!isMounted) {
          return;
        }

        if (!persisted) {
          setRoundQueue(fallbackRound);
          setRemainingQueue(fallbackRemaining);
          setMasteredCardIds([]);
          setMode("flashcard");
          setDirection("termToAnswer");
          setIsHydratedFromDb(true);
          return;
        }

        const validIndexes = new Set(defaultIndexes);
        const sanitizedRound = persisted.round_queue.filter((i) =>
          validIndexes.has(i),
        );
        const sanitizedRemaining = persisted.remaining_queue.filter((i) =>
          validIndexes.has(i),
        );

        setRoundQueue(sanitizedRound);
        setRemainingQueue(sanitizedRemaining);
        setMasteredCardIds(
          persisted.mastered_card_ids.filter((id) =>
            deck.cards.some((card) => card.id === id),
          ),
        );
        setMode(persisted.mode);
        setDirection(persisted.direction);
        setSaveStatus("saved");
      } catch {
        if (!isMounted) {
          return;
        }

        setRoundQueue(fallbackRound);
        setRemainingQueue(fallbackRemaining);
        setMasteredCardIds([]);
        setSaveStatus("error");
      } finally {
        if (isMounted) {
          setAnswer("");
          setIsSubmitted(false);
          setIsCorrect(null);
          setIsFlipped(false);
          setIsHydratedFromDb(true);
        }
      }
    };

    void hydrateProgress();

    return () => {
      isMounted = false;
    };
  }, [deck, sessionId]);

  useEffect(() => {
    if (!deck || !sessionId || !isHydratedFromDb || isTestStarted) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await saveStudyProgress({
          deckId: deck.id,
          deviceSessionId: sessionId,
          masteredCardIds,
          roundQueue,
          remainingQueue,
          mode,
          direction,
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [
    deck,
    direction,
    isHydratedFromDb,
    masteredCardIds,
    mode,
    remainingQueue,
    roundQueue,
    sessionId,
    isTestStarted,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!currentCard) {
        return;
      }

      if (mode === "flashcard") {
        if (event.code === "Space") {
          event.preventDefault();
          setIsFlipped((prev) => !prev);
        }

        if (isFlipped && event.key === "1") {
          applyCardResult(false);
        }

        if (isFlipped && event.key === "2") {
          applyCardResult(true);
        }
      }

    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const resetCardState = () => {
    setAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setIsFlipped(false);
  };

  const moveToNextRoundIfNeeded = (queue: number[], remaining: number[]) => {
    if (queue.length > 0 || remaining.length === 0) {
      return { nextRoundQueue: queue, nextRemainingQueue: remaining };
    }

    const nextRoundQueue = remaining.slice(0, ROUND_SIZE);
    const nextRemainingQueue = remaining.slice(ROUND_SIZE);

    return {
      nextRoundQueue: isRandomOrder ? shuffleArray(nextRoundQueue) : nextRoundQueue,
      nextRemainingQueue: isRandomOrder
        ? shuffleArray(nextRemainingQueue)
        : nextRemainingQueue,
    };
  };

  const applyCardResult = (known: boolean) => {
    if (isTestStarted) {
      return;
    }

    if (!currentCard || currentCardIndex === null) {
      return;
    }

    const restQueue = roundQueue.slice(1);
    const nextQueue = known
      ? restQueue
      : isRandomOrder
        ? insertAtRandomPosition(restQueue, currentCardIndex)
        : [...restQueue, currentCardIndex];

    if (known) {
      setMasteredCardIds((prev) =>
        prev.includes(currentCard.id) ? prev : [...prev, currentCard.id],
      );
      setCurrentStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setCurrentStreak(0);
    }

    const { nextRoundQueue, nextRemainingQueue } = moveToNextRoundIfNeeded(
      nextQueue,
      remainingQueue,
    );

    setRoundQueue(nextRoundQueue);
    setRemainingQueue(nextRemainingQueue);
    resetCardState();
  };

  const startTest = () => {
    if (!deck || !deck.cards.length) {
      return;
    }

    const safeCount = Math.min(Math.max(testQuestionCount, 1), deck.cards.length);
    const indexes = deck.cards.map((_, index) => index);
    const randomSample = shuffleArray(indexes).slice(0, safeCount);

    setTestQueue(randomSample);
    setTestIndex(0);
    setTestCorrectAnswers(0);
    setIsTestCompleted(false);
    setIsTestStarted(true);
    setMode("typing");
    setDirection("termToAnswer");
    resetCardState();
  };

  const handleTestNext = () => {
    if (!isTestStarted) {
      return;
    }

    const nextCorrectAnswers = isCorrect ? testCorrectAnswers + 1 : testCorrectAnswers;
    const isLastQuestion = testIndex >= testQueue.length - 1;

    if (isLastQuestion) {
      setTestCorrectAnswers(nextCorrectAnswers);
      setIsTestCompleted(true);
      setIsTestStarted(false);
      resetCardState();
      return;
    }

    setTestCorrectAnswers(nextCorrectAnswers);
    setTestIndex((prev) => prev + 1);
    resetCardState();
  };


  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!solutionText || !answer.trim()) {
      return;
    }

    const correct = isAnswerCorrect(answer, solutionText);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const toggleRandomOrder = () => {
    const nextRandomState = !isRandomOrder;
    setIsRandomOrder(nextRandomState);

    if (!nextRandomState) {
      return;
    }

    const [current, ...rest] = roundQueue;
    const shuffledRound = current === undefined ? shuffleArray(rest) : [current, ...shuffleArray(rest)];

    setRoundQueue(shuffledRound);
    setRemainingQueue(shuffleArray(remainingQueue));
  };

  const restartSession = async () => {
    if (!deck || !sessionId) {
      return;
    }

    const indexes = deck.cards.map((_, index) => index);
    const orderedIndexes = isRandomOrder ? shuffleArray(indexes) : indexes;

    setRoundQueue(orderedIndexes.slice(0, ROUND_SIZE));
    setRemainingQueue(orderedIndexes.slice(ROUND_SIZE));
    setMasteredCardIds([]);
    setCurrentStreak(0);
    setBestStreak(0);
    setMode("flashcard");
    setDirection("termToAnswer");
    setIsTestStarted(false);
    setIsTestCompleted(false);
    setTestCorrectAnswers(0);
    setTestIndex(0);
    setTestQueue([]);
    resetCardState();

    try {
      await resetStudyProgress(deck.id, sessionId);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
        Ładowanie sesji nauki...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-rose-600 font-semibold">{error}</p>
        <button
          onClick={() => navigate("/library")}
          className="px-5 h-11 rounded-lg bg-primary text-white font-semibold"
        >
          Wróć do biblioteki
        </button>
      </div>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-slate-600 font-semibold">
          Ta talia nie zawiera jeszcze fiszek.
        </p>
        <button
          onClick={() => navigate(`/decks/${deckId}/edit`)}
          className="px-5 h-11 rounded-lg bg-primary text-white font-semibold"
        >
          Dodaj fiszki
        </button>
      </div>
    );
  }

  if (isTestCompleted || isCompleted || !currentCard || !promptText || !solutionText) {
    const testPercent = testQueue.length
      ? Math.round((testCorrectAnswers / testQueue.length) * 100)
      : 0;

    return (
      <motion.div className="max-w-2xl mx-auto min-h-[65vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle className="size-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isTestCompleted ? "Test zakończony ✅" : "Sesja ukończona 🎉"}
        </h1>
        {isTestCompleted ? (
          <p className="text-slate-600">
            Twój wynik: <strong>{testCorrectAnswers}/{testQueue.length}</strong> ({testPercent}%)
            <br />
            Talia: <strong>{deck.name}</strong>
          </p>
        ) : (
          <p className="text-slate-600">
            Przerobiłeś wszystkie karty z talii <strong>{deck.name}</strong>.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => void restartSession()}
            className="h-11 px-5 rounded-lg border border-slate-300 text-slate-700 font-semibold inline-flex items-center gap-2"
          >
            <RotateCcw className="size-4" />
            Powtórz sesję
          </button>
          <button
            onClick={() => navigate("/")}
            className="h-11 px-5 rounded-lg bg-primary text-white font-semibold inline-flex items-center gap-2"
          >
            <Home className="size-4" />
            Strona główna
          </button>

        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-5xl mx-auto w-full space-y-6">
      <header className="glass-card rounded-2xl px-4 py-4 md:px-6 md:py-5 border border-slate-200 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg md:text-xl font-bold text-slate-900">{deck.name}</h1>
          <button
            onClick={() => navigate("/library")}
            className="size-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Close study session"
          >
            <X className="size-5" />
          </button>

        </div>

        <div className="grid md:grid-cols-[auto_1fr_auto] gap-3 items-center">
          <div className="bg-slate-100 p-1 rounded-xl gap-1 grid grid-cols-2 w-full md:w-auto">
            {(["flashcard", "typing"] as StudyMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={isTestStarted && m === "flashcard"}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === m
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>{isTestStarted ? "Test Progress" : "Session Progress"}</span>
              <span>{isTestStarted ? testStatsText : `${progress}%`}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: isTestStarted
                    ? `${((testIndex + 1) / Math.max(testQueue.length, 1)) * 100}%`
                    : `${progress}%`,
                }}
                className="h-full bg-primary"
              />
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>{isTestStarted ? `${testCorrectAnswers} poprawnych odpowiedzi` : `${masteredCardIds.length} / ${cardsCount} opanowanych`}</span>
              <span className="text-slate-500 text-xs">{isTestStarted ? `${testIndex + 1}/${testQueue.length}` : queueStatsText}</span>
              <span className="text-slate-500 text-xs">Streak: {currentStreak} • Best: {bestStreak}</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 justify-end">
            {saveStatus === "error" ? (
              <>
                <CloudAlert className="size-4 text-rose-500" />
                <span>Błąd zapisu</span>
              </>
            ) : (
              <>
                <CloudCheck className="size-4 text-emerald-500" />
                <span>{saveStatus === "saving" ? "Zapisywanie..." : "Zapisano"}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-6 px-2 max-w-[760px] mx-auto w-full">

        <div className="mb-6 w-full flex justify-center gap-3 flex-wrap">
          <button
            onClick={() =>
              setDirection((prev) =>
                prev === "termToAnswer" ? "answerToTerm" : "termToAnswer",
              )
            }
            className="h-10 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold inline-flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
          >
            <RefreshCw className="size-4" />
            {direction === "termToAnswer" ? "EN → PL" : "PL → EN"}
          </button>

          <button
            onClick={toggleRandomOrder}
            disabled={isTestStarted}
            className={`h-10 px-4 rounded-lg border font-semibold inline-flex items-center gap-2 transition-colors ${
              isRandomOrder
                ? "border-primary bg-primary text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary"
            }`}
          >
            <Shuffle className="size-4" />
            {isRandomOrder ? "Losowość: ON" : "Losowość: OFF"}
          </button>

          <button
            onClick={() => navigate(`/decks/${deck.id}/test`)}
            className="h-10 px-4 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold inline-flex items-center gap-2 hover:bg-indigo-100 transition-colors"
          >
            Przejdź do testu
          </button>

        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${mode}-${direction}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {mode === "flashcard" ? (
              <div className="space-y-8">
                <motion.div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-full aspect-[1.6/1] cursor-pointer relative preserve-3d"
                >
                  <div className="absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4">
                      {direction === "termToAnswer" ? "Pytanie" : "Tłumaczenie"}
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">
                      {promptText}
                    </h2>
                    <div className="mt-8 flex flex-col items-center gap-2 text-slate-400">
                      <Sparkles className="size-8 animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-tighter">
                        Spacja = obrót • 1/2 = ocena
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4">
                      Odpowiedź
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">
                      {solutionText}
                    </h2>
                  </div>
                </motion.div>

                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <button
                      onClick={() => applyCardResult(false)}
                      className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-rose-400 transition-all shadow-sm"
                    >
                      <div className="size-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Frown className="size-6" />
                      </div>
                      <span className="text-slate-900 font-bold text-lg">Powtórz później</span>
                    </button>
                    <button
                      onClick={() => applyCardResult(true)}
                      className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
                    >
                      <div className="size-12 rounded-full bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Smile className="size-6" />
                      </div>
                      <span className="font-bold text-lg">Umiem</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-[2rem] p-10 md:p-16 flex flex-col items-center text-center space-y-8 shadow-2xl shadow-primary/5 border border-slate-200">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    Typing Mode
                  </span>
                  <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">
                    {promptText}
                  </h2>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-sm font-semibold text-slate-500 ml-1">Twoja odpowiedź</label>
                      <input
                        autoFocus
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Wpisz odpowiedź..."
                        className="w-full rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 border-2 border-slate-200 bg-slate-50 h-16 px-5 text-xl font-medium placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle className="size-5 mr-2" />
                      Sprawdź
                    </button>
                  </form>
                ) : (
                  <FeedbackView
                    isCorrect={isCorrect}
                    solution={solutionText}
                    onNext={() =>
                      isTestStarted
                        ? handleTestNext()
                        : applyCardResult(Boolean(isCorrect))
                    }
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

const FeedbackView = ({
  isCorrect,
  solution,
  onNext,
}: {
  isCorrect: boolean | null;
  solution: string;
  onNext: () => void;
}) => {
  return (
    <div className="w-full space-y-4">
      {isCorrect ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <h4 className="text-emerald-900 font-bold text-lg">Dobrze!</h4>
              <p className="text-emerald-700">{solution}</p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="flex items-center justify-center rounded-xl h-12 px-8 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors w-full md:w-auto"
          >
            Następna
            <ArrowRight className="size-5 ml-2" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <XCircle className="size-6" />
            </div>
            <div>
              <h4 className="text-rose-900 font-bold text-lg">Jeszcze nie...</h4>
              <p className="text-rose-700">
                Poprawna odpowiedź: <span className="font-bold underline italic">{solution}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-white font-bold hover:bg-primary/90 transition-colors w-full md:w-auto"
          >
            Powtórz później
            <ArrowRight className="size-5 ml-2" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
