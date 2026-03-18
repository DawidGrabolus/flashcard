import {
  ArrowRight,
  BookOpen,
  Copy,
  Download,
  Edit3,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Deck } from "../../../types/deck";
import { useNavigate } from "react-router-dom";

type DeckCardProps = {
  deck: Deck;
  onDelete: (id: string) => void;
  onDuplicate: (deck: Deck) => void;
  onExport: (deck: Deck) => void;
  progressPercent?: number;
  onResetProgress: (deck: Deck) => void;
  masteredCards?: number;
};

export const EditedDeckCard = ({
  deck,
  onDelete,
  onDuplicate,
  onExport,
  onResetProgress,
  progressPercent = 0,
  masteredCards = 0,
}: DeckCardProps) => {
  const navigate = useNavigate();
  const hasProgress = progressPercent > 0 || masteredCards > 0;

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Deck
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {deck.cards.length} cards
            </p>
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
            onClick={() => onResetProgress(deck)}
            disabled={!hasProgress}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
            title={hasProgress ? "Reset progress" : "No saved progress"}
          >
            <RotateCcw size={18} />
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

      <div className="mb-5 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Postęp</span>
          <span>
            {masteredCards}/{deck.cards.length} • {progressPercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Ready to learn
        </span>
        <div className="flex items-center gap-3">
          <button
            className="text-sm font-bold text-indigo-600 hover:underline"
            onClick={() => navigate(`/decks/${deck.id}/test`)}
          >
            Test
          </button>
          <button
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            onClick={() => navigate(`/decks/${deck.id}/study`)}
          >
            Open Deck
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
