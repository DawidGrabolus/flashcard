import {
  BookOpen,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings as SettingsIcon,
  User,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-primary/20 px-6 md:px-10 py-4 bg-bg-dark sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
          <BookOpen size={24} />
        </div>
        <h2 className="text-white text-xl font-bold leading-tight tracking-tight">
          FlashLearn
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-8 items-center">
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-primary text-sm font-semibold leading-normal flex items-center gap-2"
            href="#"
          >
            <LayoutDashboard size={16} /> Dashboard
          </a>
          <a
            className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2"
            href="#"
          >
            <Library size={16} /> My Decks
          </a>
          <a
            className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2"
            href="#"
          >
            <BarChart3 size={16} /> Statistics
          </a>
          <a
            className="text-slate-400 hover:text-primary transition-colors text-sm font-medium leading-normal flex items-center gap-2"
            href="#"
          >
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
}
