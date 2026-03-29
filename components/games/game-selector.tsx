"use client";

import { useAppStore } from "@/lib/app-store";
import { MultipleChoiceGame } from "./multiple-choice-game";
import { ConnectWordsGame } from "./connect-words-game";
import { FlashcardsGame } from "./flashcards-game";
import { WordBuilderGame } from "./word-builder-game";
import { FillBlankGame } from "./fill-blank-game";
import { WordPuzzleGame } from "./word-puzzle-game";
import { ListeningGame } from "./listening-game";
import { MemoryFlipGame } from "./memory-flip-game";
import ReviewGame from "./review-game";

export function GameSelector() {
  const selectedGame = useAppStore((state) => state.selectedGame);

  switch (selectedGame) {
    case "multiple-choice":
      return <MultipleChoiceGame />;

    case "connect-words":
      return <ConnectWordsGame />;

    case "flashcards":
      return <FlashcardsGame />;

    case "word-builder":
      return <WordBuilderGame />;

    case "fill-blank":
      return <FillBlankGame />;

    case "word-puzzle":
      return <WordPuzzleGame />;

    case "listening":
      return <ListeningGame />;

    case "memory-flip":
      return <MemoryFlipGame />;

    // 🔥 GAME MỚI CỦA BẠN
    case "review":
      return <ReviewGame />;

    default:
      return null;
  }
}
