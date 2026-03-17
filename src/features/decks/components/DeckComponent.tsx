import { Deck } from "../../../types/deck";
import { Library } from "lucide-react";
import cover from "../../../assets/cover1.png";
import { nav } from "framer-motion/client";

export const DeckCard = ({ deck }: { deck: Deck }) => {
  const startStudyingHandler = () => {
    navigate(`/decks/${deck.id}/study`);
  };
  return (
    <div
      key={deck.id}
      className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-primary/40 transition-all flex flex-col h-full"
    >
      <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
        <img
          src={cover}
          alt="#"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
          Dificulti
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {deck.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6">OPIS</p>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>PROGRESS</span>
          <span className="text-primary">67%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full mb-6">
          <div
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(127,25,230,0.5)] transition-all duration-1000"
            style={{ width: `67%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <Library size={18} />
          <span className="text-sm font-semibold">
            {deck.cards.length} Cards
          </span>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-md shadow-primary/20"
        onClick={ () =>}>
          Start Studying
        </button>
      </div>
    </div>
  );
};
