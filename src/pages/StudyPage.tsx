import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bolt,
  CheckCircle,
  ArrowRight,
  XCircle,
  Frown,
  Smile,
  Sparkles,
  X,
  RotateCcw,
  Home,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Deck } from "../types/deck";
import { FlashCard } from "../types/flashCard";
import { getDeckById } from "../features/decks/services/deckServices";

type StudyMode = "flashcard" | "quiz" | "typing";

const MODE_LABELS: Record<StudyMode, string> = {
  flashcard: "Flashcards",
  quiz: "Quiz",
  typing: "Typing",
};

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = deck?.cards[currentIndex] ?? null;
  const cardsCount = deck?.cards.length ?? 0;
  const isCompleted = cardsCount > 0 && currentIndex >= cardsCount;

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

  const quizOptions = useMemo(() => {
    if (!deck || !currentCard) {
      return [];
    }

    const incorrectAnswers = deck.cards
      .filter((card) => card.id !== currentCard.id)
      .map((card) => card.answer)
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, 3);

    return [currentCard.answer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
  }, [deck, currentCard]);

  const resetCardState = () => {
    setAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setIsFlipped(false);
  };

  const handleModeChange = (nextMode: StudyMode) => {
    setMode(nextMode);
    resetCardState();
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!currentCard || !answer.trim()) {
      return;
    }

    const correct =
      answer.toLowerCase().trim() === currentCard.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleQuizSelect = (selected: string) => {
    if (!currentCard) {
      return;
    }

    const correct = selected === currentCard.answer;
    setIsCorrect(correct);
    setIsSubmitted(true);
    setAnswer(selected);
  };

  const handleNext = () => {
    if (!deck) {
      return;
    }

    resetCardState();
    setCurrentIndex((prev) => prev + 1);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    resetCardState();
  };

  const progressBase = isCompleted
    ? cardsCount
    : currentIndex + (isSubmitted || isFlipped ? 1 : 0);
  const progress = cardsCount > 0 ? (progressBase / cardsCount) * 100 : 0;

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

  if (isCompleted || !currentCard) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-5 px-4">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle className="size-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Sesja ukończona 🎉</h1>
        <p className="text-slate-600">
          Przerobiłeś wszystkie karty z talii <strong>{deck.name}</strong>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={restartSession}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-20 lg:px-40 py-4 bg-white border-b border-primary/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary text-white flex items-center justify-center">
            <Bolt className="size-6" />
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">FlashLearn</h2>
        </div>

        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
          {(["flashcard", "quiz", "typing"] as StudyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                mode === m
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Session Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.min(currentIndex + 1, cardsCount)} of {cardsCount} cards
            </span>
          </div>
          <button
            onClick={() => navigate("/library")}
            className="size-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
            aria-label="Close study session"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 max-w-[720px] mx-auto w-full">
        <div className="w-full mb-12">
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${mode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {mode === "flashcard" ? (
              <div className="space-y-8">
                <motion.div
                  onClick={() => !isFlipped && setIsFlipped(true)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-full aspect-[1.6/1] cursor-pointer relative preserve-3d"
                >
                  <div className={`absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden ${isFlipped ? "hidden" : ""}`}>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4">
                      Question {currentIndex + 1}
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">{currentCard.term}</h2>
                    <div className="mt-8 flex flex-col items-center gap-2 text-slate-400">
                      <Sparkles className="size-8 animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-tighter">Tap to reveal answer</p>
                    </div>
                  </div>
                  <div className={`absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 ${!isFlipped ? "hidden" : ""}`}>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4">
                      Answer
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">{currentCard.answer}</h2>
                  </div>
                </motion.div>

                {isFlipped && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                    <button onClick={handleNext} className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-rose-400 transition-all shadow-sm">
                      <div className="size-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Frown className="size-6" />
                      </div>
                      <span className="text-slate-900 font-bold text-lg">Needs Practice</span>
                    </button>
                    <button onClick={handleNext} className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/25">
                      <div className="size-12 rounded-full bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Smile className="size-6" />
                      </div>
                      <span className="font-bold text-lg">I Know This</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : mode === "typing" ? (
              <div className="glass-card rounded-[2rem] p-10 md:p-16 flex flex-col items-center text-center space-y-8 shadow-2xl shadow-primary/5 border border-slate-200">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    Typing Mode
                  </span>
                  <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">{currentCard.term}</h2>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-sm font-semibold text-slate-500 ml-1">Your Answer</label>
                      <input
                        autoFocus
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type here..."
                        className="w-full rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 border-2 border-slate-200 bg-slate-50 h-16 px-5 text-xl font-medium placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                      <CheckCircle className="size-5 mr-2" />
                      Check Answer
                    </button>
                  </form>
                ) : (
                  <FeedbackView isCorrect={isCorrect} card={currentCard} onNext={handleNext} />
                )}
              </div>
            ) : (
              <div className="glass-card rounded-[2rem] p-10 md:p-16 flex flex-col items-center text-center space-y-8 shadow-2xl shadow-primary/5 border border-slate-200">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Quiz Mode</span>
                  <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">{currentCard.term}</h2>
                </div>

                {!isSubmitted ? (
                  <div className="w-full grid grid-cols-1 gap-3">
                    {quizOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleQuizSelect(option)}
                        className="h-12 rounded-xl border border-slate-200 hover:border-primary text-slate-700 hover:text-primary font-semibold transition-colors px-4"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <FeedbackView isCorrect={isCorrect} card={currentCard} onNext={handleNext} />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            {mode === "typing"
              ? "Press Enter to submit"
              : mode === "flashcard"
                ? "Tap card to flip"
                : "Select an option"}
          </p>
        </div>
      </main>
    </div>
  );
}

const FeedbackView = ({
  isCorrect,
  card,
  onNext,
}: {
  isCorrect: boolean | null;
  card: FlashCard;
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
              <h4 className="text-emerald-900 font-bold text-lg">That's correct!</h4>
              <p className="text-emerald-700">{card.answer}</p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="flex items-center justify-center rounded-xl h-12 px-8 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors w-full md:w-auto"
          >
            Next Card
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
              <h4 className="text-rose-900 font-bold text-lg">Not quite...</h4>
              <p className="text-rose-700">
                Correct answer: <span className="font-bold underline italic">{card.answer}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-white font-bold hover:bg-primary/90 transition-colors w-full md:w-auto"
          >
            Continue
            <ArrowRight className="size-5 ml-2" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
