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
      </nav>

      <div className="flex items-center gap-4">d</div>
    </header>
  );
}
