import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateDeckPage from "./pages/CreateDeckPage";
import { Deck } from "./types/deck";
import { fetchDecks } from "./features/decks/services/decksService";

export default function FlashcardApp() {
  const [sets, setSets] = useState<Deck[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      const decks = await fetchDecks();
      setSets(decks);
    } catch (error) {
      console.error("Failed to load decks", error);
    }
  }, []);

  useEffect(() => {
    void loadDecks();
  }, [loadDecks]);

  const currentSet = sets.find((s) => s.id === currentSetId);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !currentSet ? (
              <Dashboard
                sets={sets}
                openSet={(id: string) => setCurrentSetId(id)}
              />
            ) : (
              <div>Study mode for {currentSet.name}</div>
            )
          }
        />
        <Route
          path="/create-deck"
          element={<CreateDeckPage onDeckCreated={loadDecks} />}
        />
      </Routes>
    </Router>
  );
}
