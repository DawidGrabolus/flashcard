import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Deck } from "../types/deck";
import Navbar from "../components/Navbar";
import { DeckCard } from "../features/decks/components/DeckComponent";
import CreateDeck from "../features/decks/components/CreateNewDeckButtonComponent";
import { deleteDeck } from "../features/decks/services/deckServices";
import { Search } from "lucide-react";

type DashboardProps = {
  sets: Deck[];
  openSet: (id: string) => void;
  onDeckSaved: () => Promise<void>;
};

export default function Dashboard({
  onDeckSaved,
  sets,
  openSet,
}: DashboardProps) {
  const navigate = useNavigate();

  const deleteDeckHandler = async (id: string) => {
    await deleteDeck(id);
    await onDeckSaved();
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
              Choose a Deck <br />
              <span className="text-primary">to Study</span>
            </h2>
            <p className="text-lg text-slate-600">
              Continue your streak or dive into something new. Your brain is
              ready for a workout.
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your library..."
                className="w-full bg-white border-2 border-slate-100 focus:border-primary focus:ring-0 rounded-xl py-4 pl-12 pr-4 text-slate-900 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sets.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}

          <CreateDeck onClick={() => navigate("/create-deck")} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
