import { useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { createDeck } from "../features/decks/services/deckServices";
import { FlashCard } from "../types/flashCard";
import DeckCardList from "../components/DeckCardList";
import { parseFlashCardsFile } from "../features/decks/utils/flashcardImport";

type CreateDeckPageProps = {
  onDeckSaved: () => Promise<void>;
};

export default function CreateDeckPage({ onDeckSaved }: CreateDeckPageProps) {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [flashCards, setCards] = useState<FlashCard[]>([]);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddCard = () => {
    setCards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        term: "",
        answer: "",
      },
    ]);
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const importedCards = await parseFlashCardsFile(file);
      setCards((prev) => [
        ...prev,
        ...importedCards.map((card) => ({ ...card, id: crypto.randomUUID() })),
      ]);
      setImportMessage(`Zaimportowano ${importedCards.length} fiszek z pliku.`);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Wystąpił błąd podczas importu.",
      );
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeck({
      name,
      cards: flashCards.map((flashCard) => ({
        term: flashCard.term,
        answer: flashCard.answer,
      })),
    });

    await onDeckSaved();
    navigate("/");
  };

  const saveTerm = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    flashCard: FlashCard,
  ) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === flashCard.id ? { ...c, term: e.target.value } : c,
      ),
    );
  };

  const saveAnswer = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    flashCard: FlashCard,
  ) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === flashCard.id ? { ...c, answer: e.target.value } : c,
      ),
    );
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col lg:flex-row gap-8 items-start"
      >
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
          <div className="relative">
            <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 rounded-2xl opacity-10" />
            <div className="relative glass p-8 rounded-2xl border border-primary/10">
              <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
                Create New Deck
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Master any subject by organizing your custom flashcard
                collection.
              </p>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Deck Title
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. Advanced Neuroscience"
                    className="w-full bg-background-light border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </label>
                  <select className="w-full bg-background-light border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none">
                    <option>Science</option>
                    <option>Languages</option>
                    <option>History</option>
                    <option>Technology</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </label>
                  <textarea
                    placeholder="What will you learn today?"
                    className="w-full bg-background-light border border-primary/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>
              </form>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass w-full p-6 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-all"
          >
            <Upload
              className="text-primary/40 mb-2 group-hover:scale-110 transition-transform"
              size={32}
            />
            <p className="text-slate-500 text-sm font-medium">
              Importuj plik CSV / TSV / TXT
            </p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
              Max 500 cards
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={handleImport}
          />
          {importMessage && (
            <p className="text-xs text-slate-500 text-center">{importMessage}</p>
          )}
        </div>

        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              FlashCard
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {flashCards.length}
              </span>
            </h3>
          </div>

          {flashCards.length > 0 && (
            <DeckCardList
              flashCards={flashCards}
              onRemoveCard={removeCard}
              setCardTermEdits={saveTerm}
              setCardAnswerEdits={saveAnswer}
            />
          )}

          <div className="pl-12 mt-4">
            <button
              onClick={handleAddCard}
              className="w-full py-4 rounded-2xl border-2 border-primary/30 border-dashed text-primary font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Flashcard
            </button>
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
      </motion.div>
    </main>
  );
}
