import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Deck } from "../types/deck";
import Navbar from "../components/Navbar";
import DeckCard from "../features/decks/components/DeckCard";
import CreateDeckCard from "../features/decks/components/CreateNewDeckCard";

type DashboardProps = {
  sets: Deck[];
  openSet: (id: string) => void;
};

export default function Dashboard({ sets, openSet }: DashboardProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen  flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center py-10 px-6">
          <div className="max-w-[1200px] w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-white text-4xl font-black">
                  Choose a Deck to Study
                </h1>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CreateDeckCard onClick={() => navigate("/create-deck")} />
              {sets.map((deck) => (
                <DeckCard key={deck.id} deck={deck} onOpen={openSet} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </AnimatePresence>
  );
}
