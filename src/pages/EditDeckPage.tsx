import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, use } from "react";
import { Settings, Plus, Save, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDeck, editDeck } from "../features/decks/services/deckServices";
import { Card } from "../types/card";
import { getDeckById } from "../features/decks/services/deckServices";
import { Deck } from "../types/deck";

type EditDeckPageProps = {
  onDeckSaved: () => Promise<void>;
};

export default function EditDeckPage({ onDeckSaved }: EditDeckPageProps) {
  const { deckId } = useParams<{ deckId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [draftTerm, setDraftTerm] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    async function loadDeck() {
      if (!deckId) {
        navigate("/");
        return;
      }

      const deck = await getDeckById(deckId);
      if (!deck) {
        navigate("/");
        return;
      }

      setName(deck.name);
      setCards(deck.cards ?? []);
      setIsLoading(false);
    }

    void loadDeck();
  }, [deckId, navigate]);

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };
  const handleAddCard = () => {
    if (draftTerm.trim() && draftAnswer.trim()) {
      setCards((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          term: draftTerm.trim(),
          answer: draftAnswer.trim(),
        },
      ]);
    }
    setDraftTerm("");
    setDraftAnswer("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await editDeck({
      deckId: deckId!,
      name,
      cards: cards.map((card) => ({ term: card.term, answer: card.answer })),
    });
    await onDeckSaved();

    navigate("/");
  };
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        Loading deck...
      </div>
    );
  }
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
              <h1 className="text-4xl font-black tracking-tight">
                Edit {name}
              </h1>
              <br />
            </div>

            <section className="bg-white/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Deck Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Deck Title</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 outline-none"
                    placeholder="Name your deck"
                    type="text"
                  />
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
                    Front
                  </label>
                  <textarea
                    value={draftTerm}
                    onChange={(e) => setDraftTerm(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="Question"
                    rows={4}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Back
                  </label>
                  <textarea
                    value={draftAnswer}
                    onChange={(e) => setDraftAnswer(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="Answer"
                    rows={4}
                  ></textarea>
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
                          <p className="text-slate-400 text-sm mt-1">
                            {card.answer}
                          </p>
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
            <div className="pt-6 border-t border-primary/20 flex flex-col md:flex-row gap-4 justify-between items-center mb-20">
              <button
                onClick={() => navigate("/")}
                className="text-slate-500 hover:text-slate-300 font-medium px-6 py-3 transition-colors"
              >
                Cancel & Discard
              </button>
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                <Save size={24} />
                Save Entire Deck
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
