import { useState, useEffect } from "react";
import SetList from "../components/SetList";
import { supabase } from "./supabaseClient";
import { Deck, Card } from "../components/types"; 

export default function FlashcardApp() {
  const [sets, setSets] = useState<Deck[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSets();
  }, []);

  async function fetchSets() {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*, cards(*)');
    
    if (error) {
      console.error(error);
    } else {
      setSets(data as Deck[]);
    }
  }

  const currentSet = sets.find((s) => s.id === currentSetId);

  if (!currentSet) {
    return (
      <SetList 
        sets={sets} 
        openSet={(id: string) => setCurrentSetId(id)}
      /> 
    );
  }
}




