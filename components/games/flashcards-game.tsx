'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { GameWrapper } from './game-wrapper'
import { Button } from '@/components/ui/button'
import { RotateCw, Check, X, Volume2 } from 'lucide-react'

const TOTAL_CARDS = 10

export function FlashcardsGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cards, setCards] = useState<VocabularyWord[]>([])

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (selectedTopic) {
      const shuffled = shuffleArray(selectedTopic.words).slice(0, TOTAL_CARDS)
      setCards(shuffled)
    }
  }, [selectedTopic])

  const handleFlip = () => {
    soundManager.playFlip()
    setIsFlipped(!isFlipped)
  }

  const handleKnow = () => {
    soundManager.playCorrect()
    addScore(10)
    addLearnedWord(cards[currentIndex], true)
    nextCard()
  }

  const handleDontKnow = () => {
    soundManager.playWrong()
    addLearnedWord(cards[currentIndex], false)
    nextCard()
  }

  const nextCard = () => {
    if (currentIndex < TOTAL_CARDS - 1) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 200)
    } else {
      setScreen('results')
    }
  }

  const speakWord = () => {
    if (soundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cards[currentIndex].english)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!selectedTopic || cards.length === 0) return null

  const currentCard = cards[currentIndex]

  return (
    <GameWrapper
      title="Flashcards"
      currentQuestion={currentIndex + 1}
      totalQuestions={TOTAL_CARDS}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center"
      >
        {/* Card */}
        <div className="perspective-1000 mb-8 w-full">
          <motion.div
            className="relative h-64 w-full cursor-pointer"
            onClick={handleFlip}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-emerald-400 p-6 shadow-2xl shadow-primary/20"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <motion.h2
                className="mb-2 text-center text-3xl font-bold text-primary-foreground"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                {currentCard.english}
              </motion.h2>
              {currentCard.pronunciation && (
                <p className="mb-4 text-center text-lg text-primary-foreground/80">
                  {currentCard.pronunciation}
                </p>
              )}
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  speakWord()
                }}
                className="mt-2 rounded-full transition-transform hover:scale-105"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <p className="mt-4 text-sm text-primary-foreground/70">
                Tap to reveal translation
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-secondary to-fuchsia-400 p-6 shadow-2xl shadow-secondary/20"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <motion.h2
                className="text-center text-3xl font-bold text-secondary-foreground"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                {currentCard.vietnamese}
              </motion.h2>
              <p className="mt-4 text-sm text-secondary-foreground/70">
                Did you know this?
              </p>
            </div>
          </motion.div>
        </div>

        {/* Flip button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={handleFlip}
            className="gap-2 rounded-full transition-all hover:scale-105"
          >
            <RotateCw className="h-4 w-4" />
            Flip Card
          </Button>
        </motion.div>

        {/* Action buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <Button
              variant="outline"
              onClick={handleDontKnow}
              className="gap-2 rounded-xl border-destructive/50 text-destructive transition-all hover:scale-105 hover:bg-destructive/10 active:scale-95"
            >
              <X className="h-4 w-4" />
              {"Don't Know"}
            </Button>
            <Button
              onClick={handleKnow}
              className="gap-2 rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
            >
              <Check className="h-4 w-4" />
              I Know This
            </Button>
          </motion.div>
        )}
      </motion.div>
    </GameWrapper>
  )
}
