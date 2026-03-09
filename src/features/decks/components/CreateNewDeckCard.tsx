import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface CreateDeckCardProps {
  onClick: () => void;
}

export default function CreateDeckCard({ onClick }: CreateDeckCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-700 p-8 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all h-full min-h-[320px]"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 group-hover:bg-primary group-hover:text-white transition-all">
        <Plus size={32} />
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-lg">Create New Deck</p>
        <p className="text-slate-400 text-sm">Add cards manually</p>
      </div>
    </motion.div>
  );
}
