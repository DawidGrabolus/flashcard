import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { Settings, Plus, Save, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDeck } from "../features/decks/services/decksService";
import { Deck } from "../types/deck";

type CreateDeckPageProps = {
  onDeckCreated: () => Promise<void>;
};

type LocalCard = {
  id: string;
  term: string;
  answer: string;
};

const colorSchemeOptions: Array<{ label: string; value: Deck["colorScheme"] }> = [
  { label: "Primary", value: "primary" },
  { label: "Purple", value: "purple" },
  { label: "Amber", value: "amber" },
  { label: "Blue", value: "blue" },
];

export default function CreateDeckPage({ onDeckCreated }: CreateDeckPageProps) {
  const [name, setName] = useState("");
  const [colorScheme, setColorScheme] = useState<Deck["colorScheme"]>("primary");
  const [draftTerm, setDraftTerm] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [cards, setCards] = useState<LocalCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isFormValid = useMemo(() => name.trim().length > 0, [name]);

  const handleAddCard = () => {
    if (!draftTerm.trim() || !draftAnswer.trim()) {
      return;
    }

    setCards((prevCards) => [
      ...prevCards,
      {
        id: crypto.randomUUID(),
        term: draftTerm.trim(),
        answer: draftAnswer.trim(),
      },
    ]);

    setDraftTerm("");
    setDraftAnswer("");
  };

  const handleRemoveCard = (cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createDeck({
        name,
        colorScheme,
        cards: cards.map((card) => ({ term: card.term, answer: card.answer })),
      });
      await onDeckCreated();
      navigate("/");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Nie udało się zapisać talii. Spróbuj ponownie.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-sans">
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl space-y-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight">Create New Deck</h1>
              <p className="text-primary/60 text-lg">
                Build a custom set of flashcards for your next study session.
              </p>
            </div>

            <section className="bg-white/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Deck Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Deck Title</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 outline-none"
                    placeholder="e.g. Molecular Biology 101"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Color Scheme</label>
                  <select
                    value={colorScheme}
                    onChange={(event) =>
                      setColorScheme(event.target.value as Deck["colorScheme"])
                    }
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 outline-none appearance-none"
                  >
                    {colorSchemeOptions.map((option) => (
                      <option
                        key={option.value}
                        className="bg-background-dark"
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Add a New Card
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Front (Question)
                  </label>
                  <textarea
                    value={draftTerm}
                    onChange={(event) => setDraftTerm(event.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="What is the powerhouse of the cell?"
                    rows={4}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Back (Answer)
                  </label>
                  <textarea
                    value={draftAnswer}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="Mitochondria"
                    rows={4}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddCard}
                  className="bg-primary/20 text-primary hover:bg-primary/30 font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Card to List
                </button>
              </div>

              {cards.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {cards.map((card, index) => (
                    <li
                      key={card.id}
                      className="rounded-xl border border-primary/20 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-primary/70">
                            Card {index + 1}
                          </p>
                          <p className="font-semibold">{card.term}</p>
                          <p className="text-slate-400 text-sm mt-1">{card.answer}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-slate-400 hover:text-red-400"
                          aria-label={`Remove card ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="pt-6 border-t border-primary/20 flex flex-col md:flex-row gap-4 justify-between items-center mb-20">
              <button
                onClick={() => navigate("/")}
                className="text-slate-500 hover:text-slate-300 font-medium px-6 py-3 transition-colors"
              >
                Cancel & Discard
              </button>
              <button
                disabled={!isFormValid || isSaving}
                onClick={handleSubmit}
                className="w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary/90 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                <Save size={24} />
                {isSaving ? "Saving..." : "Save Entire Deck"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
