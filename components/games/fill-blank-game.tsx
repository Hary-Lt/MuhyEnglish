'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { GameWrapper } from './game-wrapper'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

const TOTAL_QUESTIONS = 10

const sentenceTemplates = [
  { template: 'I need to find a good ___ for my career.', key: 'jobs' },
  { template: 'The ___ is very important for our health.', key: 'health' },
  { template: 'We should protect the ___ for future generations.', key: 'nature' },
  { template: 'I love spending time with my ___.', key: 'family' },
  { template: 'The ___ is delicious, I want more!', key: 'food' },
  { template: 'We are planning a ___ to Europe.', key: 'travel' },
  { template: 'My favorite ___ is playing in the concert.', key: 'music' },
  { template: 'I need to buy some new ___ for winter.', key: 'clothing' },
  { template: 'The ___ forecast says it will rain tomorrow.', key: 'weather' },
  { template: 'I saw a beautiful ___ at the zoo.', key: 'animals' },
]

export function FillBlankGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
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
      const letters = shuffleArray(word.split(''))
      // Add some random letters for difficulty
      const extraLetters = 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .filter((l) => !word.includes(l))
        .slice(0, Math.min(3, 26 - word.length))
      setAvailableLetters(shuffleArray([...letters, ...shuffleArray(extraLetters)]))
      setSelectedLetters([])
      setIsCorrect(null)
      setShowAnswer(false)
    }
  }, [currentIndex, questions])

  const handleLetterClick = (letter: string, index: number) => {
    const newAvailable = [...availableLetters]
    newAvailable.splice(index, 1)
    setAvailableLetters(newAvailable)
    setSelectedLetters([...selectedLetters, letter])
  }

  const handleSelectedClick = (index: number) => {
    const letter = selectedLetters[index]
    const newSelected = [...selectedLetters]
    newSelected.splice(index, 1)
    setSelectedLetters(newSelected)
    setAvailableLetters([...availableLetters, letter])
  }

  const handleCheck = () => {
    const answer = selectedLetters.join('')
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

  const handleSkip = () => {
    addLearnedWord(questions[currentIndex], false)
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setScreen('results')
    }
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Fill in the Blank"
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
          className="mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground">Spell the word for:</p>
          <h2 className="text-2xl font-bold text-primary">{currentWord.vietnamese}</h2>
        </motion.div>

        {/* Answer area */}
        <div className="mb-8 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl bg-card p-4 shadow-lg">
          {selectedLetters.length === 0 ? (
            <span className="text-muted-foreground">Tap letters below</span>
          ) : (
            selectedLetters.map((letter, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => !showAnswer && handleSelectedClick(index)}
                disabled={showAnswer}
                className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold uppercase shadow-md transition-colors ${
                  showAnswer
                    ? isCorrect
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-destructive text-destructive-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {letter}
              </motion.button>
            ))
          )}
        </div>

        {/* Available letters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {availableLetters.map((letter, index) => (
            <motion.button
              key={`${letter}-${index}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => !showAnswer && handleLetterClick(letter, index)}
              disabled={showAnswer}
              whileHover={!showAnswer ? { scale: 1.1 } : {}}
              whileTap={!showAnswer ? { scale: 0.9 } : {}}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-lg font-bold uppercase text-card-foreground shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {letter}
            </motion.button>
          ))}
        </div>

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
                {isCorrect ? 'Correct!' : `The answer is "${currentWord.english}"`}
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
              onClick={handleSkip}
              className="rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleCheck}
              disabled={selectedLetters.length === 0}
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
