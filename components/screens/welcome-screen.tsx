"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Zap, Trophy } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import { soundManager } from "@/lib/sounds";
import { topics } from "@/lib/vocabulary-data";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Thêm dòng này

const features = [
  { icon: BookOpen, text: `${topics.length} Topics`, delay: 0.2 },
  { icon: Zap, text: "8 Fun Games", delay: 0.3 },
  { icon: Trophy, text: "Track Progress", delay: 0.4 },
];

export function WelcomeScreen() {
  const setScreen = useAppStore((state) => state.setScreen);
  // Tạo state để kiểm tra xem component đã mount chưa
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBegin = () => {
    soundManager.playClick();
    setScreen("topics");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Chỉ render các hạt animation khi đã mount trên client */}
        {isMounted &&
          [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-4 w-4 rounded-full bg-primary/10"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="relative mb-8"
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-emerald-400 shadow-2xl shadow-primary/30">
          <motion.span
            className="text-6xl"
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            📚
          </motion.span>
        </div>
        <motion.div
          className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-center text-4xl font-extrabold tracking-tight text-foreground md:text-5xl"
      >
        <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          VocabMaster
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-center text-lg text-muted-foreground"
      >
        Learn English vocabulary the fun way with interactive games and lessons
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12 flex flex-wrap justify-center gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: feature.delay }}
            className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg"
          >
            <feature.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-card-foreground">
              {feature.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button
          size="lg"
          onClick={handleBegin}
          className="group relative h-16 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-12 text-xl font-bold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40"
        >
          <motion.span
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative flex items-center gap-2">
            BEGIN
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </span>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        English - Vietnamese Vocabulary
      </motion.p>
    </div>
  );
}
