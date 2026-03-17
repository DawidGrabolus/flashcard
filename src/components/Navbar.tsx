import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings as SettingsIcon,
  User,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "library" | "study"
  >("dashboard");
  const navigate = useNavigate();

  const go = (view: "dashboard" | "library" | "study", path: string) => {
    setCurrentView(view);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-primary/10 px-6 md:px-20 py-4 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => go("dashboard", "/")}
      >
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <BookOpen size={20} />
        </div>
        <h2 className="text-slate-900 text-xl font-bold tracking-tight">
          FlashLearn
        </h2>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <button
          onClick={() => go("dashboard", "/")}
          className={`text-sm font-semibold transition-colors ${currentView === "dashboard" ? "text-primary" : "text-slate-600 hover:text-primary"}`}
        >
          My Decks
        </button>
        <button
          onClick={() => go("library", "/library")}
          className={`text-sm font-semibold transition-colors ${currentView === "library" ? "text-primary" : "text-slate-600 hover:text-primary"}`}
        >
          Explore
        </button>
        <button
          onClick={() => go("study", "/study")}
          className={`text-sm font-semibold transition-colors ${currentView === "study" ? "text-primary" : "text-slate-600 hover:text-primary"}`}
        >
          Study
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
          <Bell size={20} />
        </button>
        <div className="size-10 rounded-full border-2 border-primary/20 overflow-hidden cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
            alt="Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
