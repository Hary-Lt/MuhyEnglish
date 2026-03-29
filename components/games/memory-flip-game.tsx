'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { GameWrapper } from './game-wrapper'

const PAIRS_COUNT = 6
const GAME_TIME = 60

interface Card {
  id: string
  word: VocabularyWord
  type: 'english' | 'vietnamese'
  isFlipped: boolean
  isMatched: boolean
}

export function MemoryFlipGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (selectedTopic) {
      const words = shuffleArray(selectedTopic.words).slice(0, PAIRS_COUNT)
      const cardPairs: Card[] = []

      words.forEach((word) => {
        cardPairs.push({
          id: `${word.english}-en`,
          word,
          type: 'english',
          isFlipped: false,
          isMatched: false,
        })
        cardPairs.push({
          id: `${word.english}-vi`,
          word,
          type: 'vietnamese',
          isFlipped: false,
          isMatched: false,
        })
      })

      setCards(shuffleArray(cardPairs))
    }
  }, [selectedTopic])

  const handleTimeUp = useCallback(() => {
    setScreen('results')
  }, [setScreen])

  const handleCardClick = (cardId: string) => {
    if (isChecking) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return

    soundManager.playFlip()

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    )

    if (newFlippedCards.length === 2) {
      setIsChecking(true)
      setMoves((prev) => prev + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find((c) => c.id === firstId)!
      const secondCard = cards.find((c) => c.id === secondId)!

      const isMatch =
        firstCard.word.english === secondCard.word.english &&
        firstCard.type !== secondCard.type

      setTimeout(() => {
        if (isMatch) {
          soundManager.playMatch()
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          )
          setMatchedPairs((prev) => prev + 1)
          addScore(20)
          addLearnedWord(firstCard.word, true)

          if (matchedPairs + 1 === PAIRS_COUNT) {
            soundManager.playSuccess()
            setTimeout(() => setScreen('results'), 500)
          }
        } else {
          soundManager.playWrong()
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          )
        }
        setFlippedCards([])
        setIsChecking(false)
      }, 800)
    }
  }

  if (!selectedTopic || cards.length === 0) return null

  return (
    <GameWrapper
      title="Memory Flip"
      currentQuestion={matchedPairs}
      totalQuestions={PAIRS_COUNT}
      showTimer
      timerDuration={GAME_TIME}
      onTimeUp={handleTimeUp}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center"
      >
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-6 text-center"
        >
          <div className="rounded-xl bg-card px-4 py-2 shadow-lg">
            <p className="text-xs text-muted-foreground">Moves</p>
            <p className="text-xl font-bold text-card-foreground">{moves}</p>
          </div>
          <div className="rounded-xl bg-card px-4 py-2 shadow-lg">
            <p className="text-xs text-muted-foreground">Pairs Found</p>
            <p className="text-xl font-bold text-primary">
              {matchedPairs}/{PAIRS_COUNT}
            </p>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="perspective-1000"
            >
              <motion.button
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched}
                className="relative h-24 w-full sm:h-28"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
              >
                {/* Back of card */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 shadow-lg transition-shadow hover:shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-3xl text-primary-foreground">?</span>
                </div>

                {/* Front of card */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl p-2 shadow-lg ${
                    card.isMatched
                      ? 'border-2 border-primary bg-primary/20'
                      : card.type === 'english'
                      ? 'bg-card'
                      : 'bg-secondary/20'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span
                    className={`text-center text-sm font-semibold ${
                      card.isMatched ? 'text-primary' : 'text-card-foreground'
                    }`}
                  >
                    {card.type === 'english' ? card.word.english : card.word.vietnamese}
                  </span>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          Match English words with their Vietnamese translations
        </motion.p>
      </motion.div>
    </GameWrapper>
  )
}
