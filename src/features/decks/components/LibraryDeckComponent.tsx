import { ArrowRight, BookOpen, Edit3, Trash2 } from "lucide-react";
import { Deck } from "../../../types/deck";
import { Navigate, useNavigate } from "react-router-dom";
type DeckCardProps = {
  deck: Deck;
  onDelete: (id: string) => void;
};

export const EditedDeckCard = ({ deck, onDelete }: DeckCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      key={deck.id}
      className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void 0}
            className={`size-5 rounded-md border transition-all flex items-center justify-center border-slate-300 bg-white"}`}
          ></button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => void 0}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          >
            <Edit3
              size={18}
              onClick={() => navigate(`/decks/${deck.id}/edit`)}
            />
          </button>
          <button
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            onClick={() => onDelete(deck.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
        {deck.name}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-2">OPIS</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Progress</span>
          <span className="text-primary">67%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `67%` }}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {deck.cards.length} Cards • 67
          </span>
          <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Open Deck
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
