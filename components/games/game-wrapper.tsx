'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { soundManager } from '@/lib/sounds'
import { Button } from '@/components/ui/button'

interface GameWrapperProps {
  children: React.ReactNode
  title: string
  showTimer?: boolean
  timerDuration?: number
  onTimeUp?: () => void
  currentQuestion?: number
  totalQuestions?: number
  timerKey?: number
}

export function GameWrapper({
  children,
  title,
  showTimer = false,
  timerDuration = 30,
  onTimeUp,
  currentQuestion = 0,
  totalQuestions = 10,
  timerKey = 0,
}: GameWrapperProps) {
  const { soundEnabled, toggleSound, resetGame, score } = useAppStore()
  const [timeLeft, setTimeLeft] = useState(timerDuration)

  // Sync sound manager with store
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  const handleTimeUp = useCallback(() => {
    onTimeUp?.()
  }, [onTimeUp])

  useEffect(() => {
    if (!showTimer) return
    setTimeLeft(timerDuration)
  }, [showTimer, timerDuration, timerKey])

  useEffect(() => {
    if (!showTimer || timeLeft <= 0) {
      if (timeLeft <= 0 && showTimer) {
        handleTimeUp()
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [showTimer, timeLeft, handleTimeUp])

  const timerPercentage = (timeLeft / timerDuration) * 100
  const timerColor =
    timerPercentage > 50 ? 'bg-primary' : timerPercentage > 25 ? 'bg-accent' : 'bg-destructive'

  const handleBack = () => {
    soundManager.playClick()
    resetGame()
  }

  const handleToggleSound = () => {
    soundManager.playClick()
    toggleSound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-xl transition-all duration-200 hover:scale-105 hover:bg-card active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">
              {currentQuestion} / {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.div 
              className="rounded-xl bg-primary/10 px-3 py-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              key={score}
            >
              <span className="text-sm font-bold text-primary">{score} pts</span>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSound}
              className="rounded-xl transition-all duration-200 hover:scale-105 hover:bg-card active:scale-95"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-3 max-w-2xl">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Timer bar */}
        {showTimer && (
          <div className="mx-auto mt-2 max-w-2xl">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full ${timerColor} transition-colors duration-300`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
            <motion.div 
              className="mt-1 text-center text-xs text-muted-foreground"
              animate={{ 
                color: timerPercentage <= 25 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                scale: timerPercentage <= 25 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {timeLeft}s
            </motion.div>
          </div>
        )}
      </motion.header>

      {/* Content */}
      <main className="flex flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  )
}
