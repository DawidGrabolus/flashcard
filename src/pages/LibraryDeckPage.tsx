import { Brain, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Deck } from "../types/deck";
import { EditedDeckCard } from "../features/decks/components/LibraryDeckComponent";
import { deleteDeck, duplicateDeck } from "../features/decks/services/deckServices";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadDeckCsv } from "../features/decks/utils/deckExport";

type LibraryViewProps = {
  decks: Deck[];
  onDeckSaved: () => Promise<void>;
};

type SortType = "name-asc" | "name-desc" | "cards-asc" | "cards-desc";

export default function LibraryView({ decks, onDeckSaved }: LibraryViewProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("name-asc");
  const [minCards, setMinCards] = useState<number>(0);
  const navigate = useNavigate();

  const filteredDecks = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const matching = decks.filter((deck) => {
      if (deck.cards.length < minCards) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return deck.name.toLowerCase().includes(normalized);
    });

    return matching.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "cards-asc") return a.cards.length - b.cards.length;
      return b.cards.length - a.cards.length;
    });
  }, [decks, minCards, search, sortBy]);

  const deleteDeckHandler = async (id: string) => {
    const accepted = window.confirm("Na pewno usunąć talię?");
    if (!accepted) return;

    await deleteDeck(id);
    await onDeckSaved();
  };

  const duplicateDeckHandler = async (deck: Deck) => {
    await duplicateDeck({ sourceDeck: deck });
    await onDeckSaved();
  };

  const totalCards = filteredDecks.reduce((sum, deck) => sum + deck.cards.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">My Deck Library</h2>
          <p className="text-slate-500 max-w-md">{filteredDecks.length} decks • {totalCards} cards in current view.</p>
        </div>
        <button
          onClick={() => navigate("/create-deck")}
          className="bg-primary text-white font-bold py-3 px-8 rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Deck
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search decks by title..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortType)}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="cards-desc">Most cards</option>
            <option value="cards-asc">Fewest cards</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={minCards}
            onChange={(event) => setMinCards(Number(event.target.value))}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600"
          >
            <option value={0}>Any deck size</option>
            <option value={5}>At least 5 cards</option>
            <option value={10}>At least 10 cards</option>
            <option value={20}>At least 20 cards</option>
          </select>
        </div>
      </div>

      {filteredDecks.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 p-10 text-center text-slate-500">
          No decks matching selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDecks.map((deck) => (
            <EditedDeckCard
              key={deck.id}
              deck={deck}
              onDelete={deleteDeckHandler}
              onDuplicate={duplicateDeckHandler}
              onExport={downloadDeckCsv}
            />
          ))}

          <div className="group relative overflow-hidden bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-all min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <Brain size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Generate with AI</h3>
            <p className="text-slate-500 text-sm max-w-[200px]">Upload a PDF or paste notes to generate cards instantly.</p>
            <div className="mt-6">
              <button className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20">
                Try FlashAI
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
