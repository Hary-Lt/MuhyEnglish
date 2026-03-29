"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/app-store";
import { AppHeader } from "@/components/app-header";
import { WelcomeScreen } from "@/components/screens/welcome-screen";
import { TopicScreen } from "@/components/screens/topic-screen";
import { GameMenuScreen } from "@/components/screens/game-menu-screen";
import { GameSelector } from "@/components/games/game-selector";
import { ResultsScreen } from "@/components/screens/results-screen";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const screen = useAppStore((state) => state.screen);

  // 🔥 FIX HYDRATION (quan trọng)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("words") || "[]");

    useAppStore.setState({
      learnedWords: data,
    });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />

      <div className={screen !== "playing" ? "pt-16" : ""}>
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <WelcomeScreen />
            </motion.div>
          )}

          {screen === "topics" && (
            <motion.div
              key="topics"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <TopicScreen />
            </motion.div>
          )}

          {screen === "games" && (
            <motion.div
              key="games"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GameMenuScreen />
            </motion.div>
          )}

          {screen === "playing" && (
            <motion.div
              key="playing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GameSelector />
            </motion.div>
          )}

          {screen === "results" && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <ResultsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
