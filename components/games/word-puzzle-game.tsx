'use client'

import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { GameWrapper } from './game-wrapper'
import { Button } from '@/components/ui/button'
import { Check, X, Shuffle } from 'lucide-react'

const TOTAL_QUESTIONS = 10

interface LetterTile {
  id: string
  letter: string
}

export function WordPuzzleGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [tiles, setTiles] = useState<LetterTile[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (selectedTopic) {
      const shuffled = shuffleArray(selectedTopic.words).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled)
    }
  }, [selectedTopic])

  useEffect(() => {
    if (questions.length > 0) {
      const word = questions[currentIndex].english
      const letterTiles: LetterTile[] = shuffleArray(
        word.split('').map((letter, index) => ({
          id: `${letter}-${index}`,
          letter,
        }))
      )
      setTiles(letterTiles)
      setIsCorrect(null)
      setShowAnswer(false)
    }
  }, [currentIndex, questions])

  const handleShuffle = () => {
    setTiles(shuffleArray([...tiles]))
  }

  const handleCheck = () => {
    const answer = tiles.map((t) => t.letter).join('')
    const correct = answer.toLowerCase() === questions[currentIndex].english.toLowerCase()
    setIsCorrect(correct)
    setShowAnswer(true)

    if (correct) {
      addScore(15)
    }
    addLearnedWord(questions[currentIndex], correct)

    setTimeout(() => {
      if (currentIndex < TOTAL_QUESTIONS - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setScreen('results')
      }
    }, 1500)
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Word Puzzle"
      currentQuestion={currentIndex + 1}
      totalQuestions={TOTAL_QUESTIONS}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center"
      >
        {/* Vietnamese hint */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <p className="text-sm text-muted-foreground">Arrange the letters to spell:</p>
          <h2 className="text-2xl font-bold text-primary">{currentWord.vietnamese}</h2>
        </motion.div>

        {/* Draggable tiles */}
        <Reorder.Group
          axis="x"
          values={tiles}
          onReorder={setTiles}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {tiles.map((tile) => (
            <Reorder.Item
              key={tile.id}
              value={tile}
              className={`flex h-14 w-14 cursor-grab items-center justify-center rounded-xl text-xl font-bold uppercase shadow-lg transition-colors active:cursor-grabbing ${
                showAnswer
                  ? isCorrect
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-destructive text-destructive-foreground'
                  : 'bg-card text-card-foreground hover:bg-primary/10'
              }`}
              whileHover={!showAnswer ? { scale: 1.1 } : {}}
              whileDrag={{ scale: 1.15, zIndex: 50 }}
            >
              {tile.letter}
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Current arrangement preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground">Current arrangement:</p>
          <p className="text-2xl font-bold tracking-wider text-foreground">
            {tiles.map((t) => t.letter).join('')}
          </p>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 flex items-center gap-2 rounded-xl px-6 py-3 ${
                isCorrect ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
              }`}
            >
              {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              <span className="font-semibold">
                {isCorrect ? 'Perfect!' : `The answer is "${currentWord.english}"`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {!showAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <Button
              variant="outline"
              onClick={handleShuffle}
              className="gap-2 rounded-xl"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
            <Button
              onClick={handleCheck}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Check Answer
            </Button>
          </motion.div>
        )}
      </motion.div>
    </GameWrapper>
  )
}
