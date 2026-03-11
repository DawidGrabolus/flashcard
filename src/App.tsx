import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import CreateDeckPage from "./pages/CreateDeckPage";
import EditDeckPage from "./pages/EditDeckPage";
import { supabase } from "./api/supabaseClient";
import { Deck } from "./types/deck";
import { fetchDecks } from "./features/decks/services/deckServices";

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
      <Routes>
        <Route
          path="/"
          element={
            !currentSet ? (
              <Dashboard onDeckSaved={refreshSets}
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
          element={<CreateDeckPage onDeckSaved={refreshSets} />}
        />
        <Route
          path="/decks/:deckId/edit"
          element={<EditDeckPage onDeckSaved={refreshSets} />}
        />{" "}
      </Routes>
    </Router>
  );
}
