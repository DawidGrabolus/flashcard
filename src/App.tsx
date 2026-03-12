import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/dashboard";
import CreateDeckPage from "./pages/CreateDeckPage";
import EditDeckPage from "./pages/EditDeckPage";
import { Deck } from "./types/deck";
import { fetchDecks } from "./features/decks/services/deckServices";
import { AnimatePresence, motion } from "framer-motion";

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
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              {!currentSet ? (
                <Dashboard
                  onDeckSaved={refreshSets}
                  sets={sets}
                  openSet={(id: string) => setCurrentSetId(id)}
                />
              ) : (
                <div>Study mode for {currentSet.name}</div>
              )}
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
      </Routes>
    </AnimatePresence>
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
