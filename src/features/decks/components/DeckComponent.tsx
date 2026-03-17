import { Library, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cover from "../../../assets/cover1.png";
import { Deck } from "../../../types/deck";

export const DeckCard = ({ deck }: { deck: Deck }) => {
  const navigate = useNavigate();

  const freshnessLabel = deck.created_at
    ? new Date(deck.created_at).toLocaleDateString()
    : "Recently";

  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-primary/40 transition-all flex flex-col h-full">
      <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
        <img
          src={cover}
          alt="Deck cover"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
          {freshnessLabel}
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {deck.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6">
          {deck.cards.length} flashcards ready for your next session.
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 gap-2">
        <div className="flex items-center gap-2 text-slate-500">
          <Library size={18} />
          <span className="text-sm font-semibold">{deck.cards.length} Cards</span>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3 rounded-lg text-sm transition-all flex items-center gap-1"
            onClick={() => navigate(`/decks/${deck.id}/edit`)}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md shadow-primary/20"
            onClick={() => navigate(`/decks/${deck.id}/study`)}
          >
            Study
          </button>
        </div>
      </div>
    </div>
  );
};
