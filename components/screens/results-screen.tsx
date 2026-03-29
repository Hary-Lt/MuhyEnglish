'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, ArrowLeft, RotateCcw, Check, X } from 'lucide-react'
import { useAppStore } from '@/lib/app-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Confetti from 'react-confetti'
import { useEffect, useState } from 'react'

export function ResultsScreen() {
  const { score, learnedWords, resetGame, setScreen, selectedTopic } = useAppStore()
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const correctCount = learnedWords.filter((w) => w.correct).length
  const totalWords = learnedWords.length
  const percentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    if (percentage >= 70) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [percentage])

  const getMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Outstanding!' }
    if (percentage >= 70) return { emoji: '🎉', text: 'Great job!' }
    if (percentage >= 50) return { emoji: '👍', text: 'Good effort!' }
    return { emoji: '💪', text: 'Keep practicing!' }
  }

  const message = getMessage()

  return (
    <div className="flex min-h-screen flex-col px-4 py-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <div className="mx-auto w-full max-w-lg flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 shadow-2xl shadow-primary/30"
          >
            <span className="text-5xl">{message.emoji}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            {message.text}
          </motion.h1>
          {selectedTopic && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-muted-foreground"
            >
              Topic: {selectedTopic.name}
            </motion.p>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 grid grid-cols-3 gap-4"
        >
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-accent" />
            <p className="text-2xl font-bold text-card-foreground">{score}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <Star className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-card-foreground">{percentage}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <Check className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-card-foreground">
              {correctCount}/{totalWords}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
        </motion.div>

        {/* Learned Words */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">Vocabulary Learned</h2>
          <ScrollArea className="h-64 rounded-2xl bg-card p-4 shadow-lg">
            <div className="space-y-2">
              {learnedWords.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={`flex items-center justify-between rounded-xl p-3 ${
                    word.correct ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-card-foreground">{word.english}</p>
                    <p className="text-sm text-muted-foreground">{word.vietnamese}</p>
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      word.correct ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {word.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button
            variant="outline"
            onClick={() => setScreen('topics')}
            className="flex-1 gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Topic
          </Button>
          <Button
            onClick={resetGame}
            className="flex-1 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
