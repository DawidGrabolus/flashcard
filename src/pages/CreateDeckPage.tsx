import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import React, { useState } from "react";
import { Settings, Plus, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateDeckPage() {
  const [name, setName] = useState("");
  const [colorScheme, setColorScheme] = useState<
    "primary" | "purple" | "amber" | "blue"
  >("primary");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Tutaj logika tworzenia decku, np. zapis do Supabase
    console.log("Creating deck:", { name, colorScheme });
    // Po utworzeniu, wróć do dashboard
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100 font-sans">
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl space-y-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight">
                Create New Deck
              </h1>
              <p className="text-primary/60 text-lg">
                Build a custom set of flashcards for your next study session.
              </p>
            </div>

            <section className="bg-white/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Deck Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Deck Title</label>
                  <input
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 outline-none"
                    placeholder="e.g. Molecular Biology 101"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Category</label>
                  <select className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 outline-none appearance-none">
                    <option className="bg-background-dark">Science</option>
                    <option className="bg-background-dark">Language</option>
                    <option className="bg-background-dark">History</option>
                    <option className="bg-background-dark">Medicine</option>
                    <option className="bg-background-dark">Programming</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Add a New Card
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Front (Question)
                  </label>
                  <textarea
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="What is the powerhouse of the cell?"
                    rows={4}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Back (Answer)
                  </label>
                  <textarea
                    className="w-full rounded-xl bg-white/5 border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none resize-none"
                    placeholder="Mitochondria"
                    rows={4}
                  ></textarea>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={void 0}
                  className="bg-primary/20 text-primary hover:bg-primary/30 font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Card to List
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="pt-6 border-t border-primary/20 flex flex-col md:flex-row gap-4 justify-between items-center mb-20">
              <button
                onClick={() => navigate("/")}
                className="text-slate-500 hover:text-slate-300 font-medium px-6 py-3 transition-colors"
              >
                Cancel & Discard
              </button>
              <button
                onClick={void 0}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                <Save size={24} />
                Save Entire Deck
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
