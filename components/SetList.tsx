import { motion } from 'framer-motion';
import {  Layers, 
  Play,  
  Plus, 
  BookOpen,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings as SettingsIcon,
  User } from 'lucide-react';
import { Deck } from './types';

interface SetListProps {
  sets: Deck[];
  openSet: (id: string) => void;
}
const Navbar = () => (
  <header className="flex items-center justify-between border-b border-primary/20 px-6 md:px-10 py-4 bg-bg-dark sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
        <BookOpen size={24} />
      </div>
      <h2 className="text-white text-xl font-bold leading-tight tracking-tight">FlashLearn</h2>
    </div>
    <div className="flex flex-1 justify-end gap-8 items-center">
      <nav className="hidden md:flex items-center gap-8">
        <a className="text-primary text-sm font-semibold leading-normal flex items-center gap-2" href="#">
          <LayoutDashboard size={16} /> Dashboard
        </a>
        <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2" href="#">
          <Library size={16} /> My Decks
        </a>
        <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2" href="#">
          <BarChart3 size={16} /> Statistics
        </a>
        <a className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2" href="#">
          <SettingsIcon size={16} /> Settings
        </a>
      </nav>
      <div className="bg-primary/20 rounded-full p-1 border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors">
        <div className="bg-slate-800 rounded-full size-8 flex items-center justify-center text-primary">
          <User size={18} />
        </div>
      </div>
    </div>
  </header>
);

const DeckCard = ({ deck, onOpen }: { deck: Deck; onOpen: (id: string) => void }) => {
  const colorMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary bg-primary/10',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-500 bg-amber-500/10',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-500 bg-blue-500/10',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-500 bg-purple-500/10',
  };

  const currentColors = colorMap[deck.colorScheme] || colorMap.primary;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-slate-800/40 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-700/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className={`h-32 w-full bg-gradient-to-br ${currentColors.split(' ').slice(0, 2).join(' ')} relative`}>
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
          <Layers size={12} className={currentColors.split(' ')[2]} />
          <span className="text-[10px] font-bold text-slate-300">{deck.cards?.length || 0} CARDS</span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 gap-4 text-left">
        <div>
          <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors">{deck.name}</h3>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed uppercase">Kategoria</p>
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

const CreateDeckCard = () => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
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

export default function SetList({ sets, openSet }: SetListProps) {
  return (
    <div className="min-h-screen  flex flex-col">
       <Navbar />
      <main className="flex-1 flex justify-center py-10 px-6">
        <div className="max-w-[1200px] w-full flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-white text-4xl font-black">Choose a Deck to Study</h1>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CreateDeckCard />
            {sets.map((deck) => (
              <DeckCard 
                key={deck.id} 
                deck={deck} 
                onOpen={openSet} 
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}