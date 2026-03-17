import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateDeckPage from "./pages/CreateDeckPage";
import EditDeckPage from "./pages/EditDeckPage";
import { Deck } from "./types/deck";
import { fetchDecks } from "./features/decks/services/deckServices";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import LibraryDeckPage from "./pages/LibraryDeckPage";

type PageTransitionProps = {
  children: React.ReactNode;
};

function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes({
  sets,
  currentSet,
  refreshSets,
  setCurrentSetId,
}: {
  sets: Deck[];
  currentSet: Deck | undefined;
  refreshSets: () => Promise<void>;
  setCurrentSetId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Dashboard
                  onDeckSaved={refreshSets}
                  sets={sets}
                  openSet={(id: string) => setCurrentSetId(id)}
                />
              </PageTransition>
            }
          />
          <Route
            path="/create-deck"
            element={
              <PageTransition>
                <CreateDeckPage onDeckSaved={refreshSets} />
              </PageTransition>
            }
          />
          <Route
            path="/decks/:deckId/edit"
            element={
              <PageTransition>
                <EditDeckPage onDeckSaved={refreshSets} />
              </PageTransition>
            }
          />
          <Route
            path="/library"
            element={
              <PageTransition>
                <LibraryDeckPage decks={sets} onDeckSaved={refreshSets} />
              </PageTransition>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function FlashcardApp() {
  const [sets, setSets] = useState<Deck[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);

  useEffect(() => {
    void loadSets();
  }, []);

  async function loadSets() {
    const data = await fetchDecks();
    setSets(data);
  }

  const refreshSets = async () => {
    await loadSets();
  };

  const currentSet = sets.find((s) => s.id === currentSetId);

  return (
    <Router>
      <AppRoutes
        sets={sets}
        currentSet={currentSet}
        refreshSets={refreshSets}
        setCurrentSetId={setCurrentSetId}
      />
    </Router>
  );
}
