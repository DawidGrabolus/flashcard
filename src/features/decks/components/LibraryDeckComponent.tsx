import { ArrowRight, BookOpen, Copy, Download, Edit3, Trash2 } from "lucide-react";
import { Deck } from "../../../types/deck";
import { useNavigate } from "react-router-dom";

type DeckCardProps = {
  deck: Deck;
  onDelete: (id: string) => void;
  onDuplicate: (deck: Deck) => void;
  onExport: (deck: Deck) => void;
};

export const EditedDeckCard = ({
  deck,
  onDelete,
  onDuplicate,
  onExport,
}: DeckCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Deck</p>
            <p className="text-sm font-semibold text-slate-700">{deck.cards.length} cards</p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/decks/${deck.id}/edit`)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="Edit deck"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onDuplicate(deck)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Duplicate deck"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => onExport(deck)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Export CSV"
          >
            <Download size={18} />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            onClick={() => onDelete(deck.id)}
            title="Delete deck"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
        {deck.name}
      </h3>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Ready to learn
        </span>
        <button
          className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          onClick={() => navigate(`/decks/${deck.id}/study`)}
        >
          Open Deck
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
