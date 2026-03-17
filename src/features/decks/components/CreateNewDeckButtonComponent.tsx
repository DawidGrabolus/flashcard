import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface CreateDeckProps {
  onClick: () => void;
}

export default function CreateDeck({ onClick }: CreateDeckProps) {
  return (
    <div
      onClick={onClick}
      className="group h-full min-h-[400px] border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary/5 hover:border-primary transition-all cursor-pointer"
    >
      <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        <Plus size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">Create New Deck</h3>
      <p className="text-slate-500 text-sm max-w-[200px]">
        Organize your notes into a new set of flashcards
      </p>
    </div>
  );
}
