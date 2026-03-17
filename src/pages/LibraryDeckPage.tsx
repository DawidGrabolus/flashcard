import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Edit3,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Deck } from "../types/deck";
import { EditedDeckCard } from "../features/decks/components/LibraryDeckComponent";
import { deleteDeck } from "../features/decks/services/deckServices";
import { useNavigate } from "react-router-dom";

type LibraryViewProps = {
  decks: Deck[];
  onDeckSaved: () => Promise<void>;
};

export default function LibraryView({ decks, onDeckSaved }: LibraryViewProps) {
  const deleteDeckHandler = async (id: string) => {
    await deleteDeck(id);
    await onDeckSaved();
  };
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            My Deck Library
          </h2>
          <p className="text-slate-500 max-w-md">
            Manage, edit, and organize all your flashcard decks with ease.
          </p>
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
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search decks by title or category..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600">
            <span className="text-sm font-medium">Category</span>
            <ChevronDown size={18} />
          </button>
        </div>
        <div className="lg:col-span-2">
          <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600">
            <span className="text-sm font-medium">Recently Created</span>
            <ChevronDown size={18} />
          </button>
        </div>
        <div className="lg:col-span-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-primary/5 border border-primary/20 rounded-2xl text-primary font-bold hover:bg-primary/10 transition-colors">
            <MoreVertical size={18} />
            Sort
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {decks.map((deck) => (
          <EditedDeckCard
            key={deck.id}
            deck={deck}
            onDelete={deleteDeckHandler}
          />
        ))}

        <div className="group relative overflow-hidden bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-all min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <Brain size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Generate with AI
          </h3>
          <p className="text-slate-500 text-sm max-w-[200px]">
            Upload a PDF or paste notes to generate cards instantly.
          </p>
          <div className="mt-6">
            <button className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20">
              Try FlashAI
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
