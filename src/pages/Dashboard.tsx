import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Deck } from "../types/deck";
import { DeckCard } from "../features/decks/components/DeckComponent";
import CreateDeck from "../features/decks/components/CreateNewDeckButtonComponent";
import { Search } from "lucide-react";

type DashboardProps = {
  sets: Deck[];
  openSet: (id: string) => void;
  onDeckSaved: () => Promise<void>;
};

export default function Dashboard({ sets }: DashboardProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");

  const visibleDecks = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const filtered = sets.filter((deck) =>
      deck.name.toLowerCase().includes(normalized),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "size") {
        return b.cards.length - a.cards.length;
      }

      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  }, [search, sets, sortBy]);

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
              {sets.length} decks available. Find the right one and start learning.
            </p>
          </div>
          <div className="w-full lg:max-w-md flex gap-2">
            <div className="relative group flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your library..."
                className="w-full bg-white border-2 border-slate-100 focus:border-primary focus:ring-0 rounded-xl py-4 pl-12 pr-4 text-slate-900 transition-all shadow-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "recent" | "name" | "size")}
              className="bg-white border-2 border-slate-100 rounded-xl px-4"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="size">Cards</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {visibleDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}

          <CreateDeck onClick={() => navigate("/create-deck")} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
