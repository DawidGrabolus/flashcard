import { use, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Bolt,
  CheckCircle,
  ArrowRight,
  XCircle,
  Frown,
  Smile,
  Sparkles,
  X,
} from "lucide-react";
import { Deck } from "../types/deck";
import { motion } from "framer-motion";
import { FlashCard } from "../types/flashCard";
import { getDeckById } from "../features/decks/services/deckServices";
import { useNavigate, useParams } from "react-router-dom";

type StudyMode = "flashcard" | "quiz" | "typing";

export default function StudySession({}: {}) {
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = deck?.cards[currentIndex];

  useEffect(() => {
    if (!deckId) return;
    getDeckById(deckId).then(setDeck);
  }, [deckId]);
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mode === "typing" && !answer.trim()) return;

    const correct =
      answer.toLowerCase().trim() === currentCard?.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleQuizSelect = (selected: string) => {
    const correct = selected === currentCard?.answer;
    setIsCorrect(correct);
    setIsSubmitted(true);
    setAnswer(selected);
  };

  const handleNext = () => {
    if (currentIndex < deck?.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswer("");
      setIsSubmitted(false);
      setIsCorrect(null);
      setIsFlipped(false);
    } else {
      void 0;
    }
  };

  const progress =
    ((currentIndex + (isSubmitted || isFlipped ? 1 : 0)) / deck.cards.length) *
    100;

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-20 lg:px-40 py-4 bg-white border-b border-primary/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary text-white flex items-center justify-center">
            <Bolt className="size-6" />
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">
            FlashLearn
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
          {(["flashcard", "quiz", "typing"] as StudyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setIsSubmitted(false);
                setIsFlipped(false);
                setAnswer("");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                mode === m
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Session Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {currentIndex + 1} of {deck?.cards.length} cards
            </span>
          </div>
          <button
            onClick={void 0}
            className="size-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 max-w-[720px] mx-auto w-full">
        {/* Progress Bar */}
        <div className="w-full mb-12">
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        {/* Flashcard */}
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
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="w-full aspect-[1.6/1] cursor-pointer relative preserve-3d"
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden ${isFlipped ? "hidden" : ""}`}
                  >
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4">
                      Question {currentIndex + 1}
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">
                      {currentCard?.term}
                    </h2>
                    <div className="mt-8 flex flex-col items-center gap-2 text-slate-400">
                      <Sparkles className="size-8 animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-tighter">
                        Tap to reveal answer
                      </p>
                    </div>
                  </div>
                  {/* Back */}
                  <div
                    className={`absolute inset-0 glass-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 ${!isFlipped ? "hidden" : ""}`}
                  >
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-4">
                      Answer
                    </span>
                    <h2 className="text-slate-900 text-3xl font-extrabold leading-tight">
                      {currentCard?.answer}
                    </h2>
                    <p className="mt-4 text-slate-500 max-w-md">
                      {currentCard?.answer}
                    </p>
                  </div>
                </motion.div>

                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <button
                      onClick={handleNext}
                      className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-rose-400 transition-all shadow-sm"
                    >
                      <div className="size-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Frown className="size-6" />
                      </div>
                      <span className="text-slate-900 font-bold text-lg">
                        Needs Practice
                      </span>
                      <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                        Review Soon
                      </span>
                    </button>
                    <button
                      onClick={handleNext}
                      className="group flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
                    >
                      <div className="size-12 rounded-full bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Smile className="size-6" />
                      </div>
                      <span className="font-bold text-lg">I Know This</span>
                      <span className="text-white/70 text-xs uppercase tracking-widest font-bold">
                        Mark as Mastered
                      </span>
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
                    {currentCard?.term}
                  </h2>
                </div>

                {!isSubmitted ? (
                  <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-6"
                  >
                    <div className="flex flex-col items-start gap-2">
                      <label className="text-sm font-semibold text-slate-500 ml-1">
                        Your Answer
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type here..."
                        className="w-full rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 border-2 border-slate-200 bg-slate-50 h-16 px-5 text-xl font-medium placeholder:text-slate-400 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle className="size-5 mr-2" />
                      Check Answer
                    </button>
                  </form>
                ) : (
                  <FeedbackView
                    isCorrect={isCorrect}
                    card={currentCard}
                    onNext={handleNext}
                  />
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
              <h4 className="text-emerald-900 font-bold text-lg">
                That's correct!
              </h4>
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
                Correct answer:{" "}
                <span className="font-bold underline italic">
                  {card.answer}
                </span>
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
