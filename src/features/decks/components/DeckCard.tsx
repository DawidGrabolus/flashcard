import { motion } from "framer-motion";
import { Deck } from "../../../types/deck";
import { Edit3, Layers, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeckCard = ({
  deck,
  onOpen,
  onDelete,
}: {
  deck: Deck;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const currentColors =
    "from-primary/20 to-primary/5 text-primary bg-primary/10";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative group flex flex-col bg-slate-800/40 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-700/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => navigate(`decks/${deck.id}/edit`)}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="text-slate-400 hover:text-red-400 p-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
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
