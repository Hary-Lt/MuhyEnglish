"use client";

import { create } from "zustand";
import type { Topic, VocabularyWord } from "./vocabulary-data";

export type GameType =
  | "connect-words"
  | "multiple-choice"
  | "fill-blank"
  | "flashcards"
  | "word-builder"
  | "word-puzzle"
  | "listening"
  | "memory-flip"
  | "review";

export type AppScreen = "welcome" | "topics" | "games" | "playing" | "results";

interface LearnedWord {
  english: string;
  vietnamese: string;
  correct: boolean;
}

interface AppState {
  screen: AppScreen;
  selectedTopic: Topic | null;
  selectedGame: GameType | null;
  score: number;
  totalQuestions: number;
  learnedWords: LearnedWord[];
  soundEnabled: boolean;

  // Actions
  setScreen: (screen: AppScreen) => void;
  selectTopic: (topic: Topic) => void;
  selectGame: (game: GameType) => void;
  addScore: (points: number) => void;
  addLearnedWord: (word: VocabularyWord, correct: boolean) => void;
  resetGame: () => void;
  toggleSound: () => void;
  goToWelcome: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "welcome",
  selectedTopic: null,
  selectedGame: null,
  score: 0,
  totalQuestions: 0,
  learnedWords: [],
  soundEnabled: true,

  setScreen: (screen) => set({ screen }),

  selectTopic: (topic) => set({ selectedTopic: topic, screen: "games" }),

  selectGame: (game) =>
    set({
      selectedGame: game,
      screen: "playing",
      score: 0,
      totalQuestions: 0,
      learnedWords: [],
    }),

  addScore: (points) =>
    set((state) => ({
      score: state.score + points,
      totalQuestions: state.totalQuestions + 1,
    })),

  addLearnedWord: (word, correct) =>
    set((state) => ({
      learnedWords: [
        ...state.learnedWords,
        {
          english: word.english,
          vietnamese: word.vietnamese,
          correct,
        },
      ],
    })),

  resetGame: () =>
    set({
      score: 0,
      totalQuestions: 0,
      learnedWords: [],
      screen: "games",
    }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  goToWelcome: () =>
    set({
      screen: "welcome",
      selectedTopic: null,
      selectedGame: null,
      score: 0,
      totalQuestions: 0,
      learnedWords: [],
    }),
}));
