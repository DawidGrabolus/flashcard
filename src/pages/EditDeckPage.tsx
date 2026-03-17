import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, use } from "react";
import {
  Settings,
  Plus,
  Save,
  Trash2,
  Edit,
  Edit3,
  X,
  ChevronRight,
  Info,
  Upload,
  GripVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDeck, editDeck } from "../features/decks/services/deckServices";
import { FlashCard } from "../types/flashCard";
import DeckCardList from "../components/DeckCardList";
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
  const [flashCards, setflashCards] = useState<FlashCard[]>([]);

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
      setflashCards(deck.cards ?? []);
      setIsLoading(false);
    }

    void loadDeck();
  }, [deckId, navigate]);

  const handleRemoveCard = (id: string) => {
    setflashCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleAddCard = () => {
    setflashCards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        term: "",
        answer: "",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await editDeck({
      deckId: deckId!,
      name,
      cards: flashCards.map((card) => ({
        term: card.term,
        answer: card.answer,
      })),
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
  const saveTerm = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    flashCard: FlashCard,
  ) => {
    setflashCards((prev) =>
      prev.map((c) =>
        c.id === flashCard.id ? { ...c, term: e.target.value } : c,
      ),
    );
  };

  const saveAnswer = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    flashCard: FlashCard,
  ) => {
    setflashCards((prev) =>
      prev.map((c) =>
        c.id === flashCard.id ? { ...c, answer: e.target.value } : c,
      ),
    );
  };
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <button onClick={void 0} className="hover:text-primary">
            Library
          </button>
          <ChevronRight size={14} />
          <span className="hover:text-primary cursor-pointer">KATEGORIA</span>
          <ChevronRight size={14} />
          <span className="text-primary font-medium">Edit Deck</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Settings size={20} />
                </div>
                <h3 className="text-lg font-bold">Deck Settings</h3>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    defaultValue={name}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary h-11 px-4 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    defaultValue="opis"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary p-4 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Category
                  </label>
                  <select className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary h-11 px-4 text-sm">
                    <option>asd</option>
                    <option>Science</option>
                    <option>Languages</option>
                  </select>
                </div>
                <div className="pt-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      Public Access
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Info size={18} />
                <h4>Pro Tip</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use Markdown in your cards to highlight chemical formulas. You
                can also drag and drop cards to reorder them for a specific
                study flow.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full rounded-lg h-11 border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                <Upload size={18} />
                Import CSV/Excel
              </button>
              <button className="flex items-center justify-center gap-2 w-full rounded-lg h-11 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                <Trash2 size={18} />
                Archive Deck
              </button>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black tracking-tight">Cards</h2>
                <span className="text-slate-500 font-medium">
                  ({flashCards.length} cards)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {flashCards.length > 0 && (
                <DeckCardList
                  flashCards={flashCards}
                  onRemoveCard={handleRemoveCard}
                  setCardTermEdits={saveTerm}
                  setCardAnswerEdits={saveAnswer}
                />
              )}

              <div
                onClick={handleAddCard}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary/40 hover:text-primary transition-all cursor-pointer bg-slate-50/50"
              >
                <Plus size={32} />
                <span className="font-bold">Append New Card</span>
              </div>
            </div>

            <div className="pl-12 mt-12 flex flex-wrap gap-4 items-center">
              <button
                onClick={handleSubmit}
                className="flex-1 min-w-[160px] bg-primary text-white py-4 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Deck
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 min-w-[160px] bg-background-light text-slate-600 py-4 px-8 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      ;
    </main>
  );
}
