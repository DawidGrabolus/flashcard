import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Home, RotateCcw, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Deck } from "../types/deck";
import { getDeckById } from "../features/decks/services/deckServices";

const DEFAULT_TEST_SIZE = 30;

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

const shuffleArray = <T,>(values: T[]): T[] => {
  const copy = [...values];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

export default function DeckTestPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionCount, setQuestionCount] = useState(DEFAULT_TEST_SIZE);
  const [testQueue, setTestQueue] = useState<number[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
        setQuestionCount(Math.min(DEFAULT_TEST_SIZE, fetchedDeck.cards.length));
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

  const currentCard = useMemo(() => {
    if (!deck || !isStarted) {
      return null;
    }

    const cardIndex = testQueue[testIndex];
    return typeof cardIndex === "number" ? deck.cards[cardIndex] : null;
  }, [deck, isStarted, testIndex, testQueue]);

  const startTest = () => {
    if (!deck || !deck.cards.length) {
      return;
    }

    const safeCount = Math.min(Math.max(questionCount, 1), deck.cards.length);
    const indexes = deck.cards.map((_, index) => index);

    setTestQueue(shuffleArray(indexes).slice(0, safeCount));
    setTestIndex(0);
    setCorrectAnswers(0);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAnswer("");
    setIsFinished(false);
    setIsStarted(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!currentCard || !answer.trim()) {
      return;
    }

    const correct = isAnswerCorrect(answer, currentCard.answer);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (!isSubmitted) {
      return;
    }

    const nextCorrectCount = isCorrect ? correctAnswers + 1 : correctAnswers;
    const isLast = testIndex >= testQueue.length - 1;

    if (isLast) {
      setCorrectAnswers(nextCorrectCount);
      setIsFinished(true);
      setIsStarted(false);
      setIsSubmitted(false);
      setIsCorrect(null);
      setAnswer("");
      return;
    }

    setCorrectAnswers(nextCorrectCount);
    setTestIndex((prev) => prev + 1);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAnswer("");
  };

  const resetTest = () => {
    setIsStarted(false);
    setIsFinished(false);
    setTestQueue([]);
    setTestIndex(0);
    setCorrectAnswers(0);
    setAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Ładowanie testu...</div>;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-rose-600 font-semibold">{error}</p>
        <button onClick={() => navigate("/library")} className="h-11 px-5 rounded-lg bg-primary text-white font-semibold">
          Wróć do biblioteki
        </button>
      </div>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-700 font-semibold">Ta talia nie zawiera jeszcze fiszek.</p>
        <button onClick={() => navigate(`/decks/${deckId}/edit`)} className="h-11 px-5 rounded-lg bg-primary text-white font-semibold">
          Dodaj fiszki
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percent = Math.round((correctAnswers / Math.max(testQueue.length, 1)) * 100);

    return (
      <motion.div className="max-w-2xl mx-auto min-h-[65vh] flex flex-col items-center justify-center text-center gap-6">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle className="size-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Test zakończony ✅</h1>
        <p className="text-slate-600">
          Wynik: <strong>{correctAnswers}/{testQueue.length}</strong> ({percent}%)
        </p>
        <div className="flex gap-3">
          <button onClick={resetTest} className="h-11 px-5 rounded-lg border border-slate-300 text-slate-700 font-semibold inline-flex items-center gap-2">
            <RotateCcw className="size-4" />
            Nowy test
          </button>
          <button onClick={() => navigate(`/decks/${deck.id}/study`)} className="h-11 px-5 rounded-lg bg-primary text-white font-semibold inline-flex items-center gap-2">
            <Home className="size-4" />
            Wróć do nauki
          </button>
        </div>
      </motion.div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Test: {deck.name}</h1>
        <p className="text-slate-600">Wybierz liczbę losowych słówek do testu.</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={deck.cards.length}
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value) || 1)}
            className="h-11 w-28 border border-slate-200 rounded-lg px-3"
          />
          <span className="text-slate-600">/ {deck.cards.length} dostępnych</span>
        </div>
        <div className="flex gap-3">
          <button onClick={startTest} className="h-11 px-5 rounded-lg bg-primary text-white font-semibold">
            Start testu
          </button>
          <button onClick={() => navigate(`/decks/${deck.id}/study`)} className="h-11 px-5 rounded-lg border border-slate-300 text-slate-700 font-semibold">
            Wróć
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Pytanie {testIndex + 1}/{testQueue.length}</span>
        <span>Poprawne: {correctAnswers}</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-900">{currentCard?.term}</h2>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Wpisz tłumaczenie..."
            className="w-full h-12 rounded-lg border border-slate-300 px-4"
          />
          <button type="submit" className="h-11 px-5 rounded-lg bg-primary text-white font-semibold">
            Sprawdź
          </button>
        </form>
      ) : (
        <div className={`p-4 rounded-xl border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            {isCorrect ? <CheckCircle className="text-emerald-600" /> : <XCircle className="text-rose-600" />}
            <p className="font-semibold">
              {isCorrect ? "Dobrze!" : "Niepoprawna odpowiedź"}
            </p>
          </div>
          {!isCorrect && (
            <p className="text-sm text-slate-700 mb-3">
              Poprawna odpowiedź: <strong>{currentCard?.answer}</strong>
            </p>
          )}
          <button onClick={handleNext} className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold">
            Następne pytanie
          </button>
        </div>
      )}
    </div>
  );
}
