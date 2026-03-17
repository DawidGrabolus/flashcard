import React from "react";
import { FlashCard } from "../types/flashCard";
import { Save, Trash2, Edit3, X } from "lucide-react";

type DeckCardListProps = {
  flashCards: FlashCard[];
  onRemoveCard: (id: string) => void;
  setCardTermEdits: (
    value: React.ChangeEvent<HTMLTextAreaElement>,
    card: FlashCard,
  ) => void;
  setCardAnswerEdits: (
    value: React.ChangeEvent<HTMLTextAreaElement>,
    card: FlashCard,
  ) => void;
};

export default function DeckCardList({
  flashCards,
  onRemoveCard,
  setCardTermEdits,
  setCardAnswerEdits,
}: DeckCardListProps) {
  return (
    <ul className="mt-6 space-y-3">
      {flashCards.map((flashCard, index) => {
        const i = index + 1;
        return (
          <li
            key={flashCard.id}
            className="rounded-xl border border-primary/20 bg-white/5 px-4 py-3"
          >
            <div className="flex gap-4 group">
              <div className="flex-none pt-6 text-slate-300 font-black text-xl italic w-8">
                {i.toString().padStart(2, "0")}
              </div>
              <div className="flex-1 glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">
                      Front Side
                    </label>
                    <textarea
                      value={flashCard.term}
                      onChange={(e) => setCardTermEdits(e, flashCard)}
                      placeholder="Question or term..."
                      className="w-full bg-transparent border-b border-slate-200 focus:border-primary outline-none py-2 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">
                      Back Side
                    </label>
                    <textarea
                      value={flashCard.answer}
                      onChange={(e) => setCardAnswerEdits(e, flashCard)}
                      placeholder="Answer or definition..."
                      className="w-full bg-transparent border-b border-slate-200 focus:border-primary outline-none py-2 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    onClick={() => onRemoveCard(flashCard.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
