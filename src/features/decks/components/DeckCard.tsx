import { motion } from "framer-motion";
import { Deck } from "../../../types/deck";
import { Layers, Play } from "lucide-react";

const DeckCard = ({
  deck,
  onOpen,
}: {
  deck: Deck;
  onOpen: (id: string) => void;
}) => {
  const colorMap: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 text-primary bg-primary/10",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-500 bg-amber-500/10",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-500 bg-blue-500/10",
    purple:
      "from-purple-500/20 to-purple-500/5 text-purple-500 bg-purple-500/10",
  };

  const currentColors = colorMap[deck.colorScheme] || colorMap.primary;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-slate-800/40 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-700/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div
        className={`h-32 w-full bg-gradient-to-br ${currentColors.split(" ").slice(0, 2).join(" ")} relative`}
      >
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
          <Layers size={12} className={currentColors.split(" ")[2]} />
          <span className="text-[10px] font-bold text-slate-300">
            {deck.cards?.length || 0} CARDS
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4 text-left">
        <div>
          <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors">
            {deck.name}
          </h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed uppercase">
            Kategoria
          </p>
        </div>
        <button
          onClick={() => onOpen(deck.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700/50 py-3 text-white font-bold hover:bg-primary transition-all"
        >
          <Play size={16} fill="currentColor" /> Start Studying
        </button>
      </div>
    </motion.div>
  );
};

export default DeckCard;
