import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import CreateDeckPage from "./pages/CreateDeckPage";
import { supabase } from "./api/supabaseClient";
import { Deck } from "./types/deck";

export default function FlashcardApp() {
  const [sets, setSets] = useState<Deck[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);

  useEffect(() => {
    fetchSets();
  }, []);

  async function fetchSets() {
    const { data, error } = await supabase
      .from("flashcard_sets")
      .select("*, cards(*)");

    if (error) {
      console.error(error);
    } else {
      setSets(data as Deck[]);
    }
  }

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
        <Route path="/create-deck" element={<CreateDeckPage />} />
      </Routes>
    </Router>
  );
}
