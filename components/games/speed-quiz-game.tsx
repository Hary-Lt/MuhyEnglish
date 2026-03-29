'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { GameWrapper } from './game-wrapper'
import { Check, X, Zap } from 'lucide-react'

const TOTAL_QUESTIONS = 10
const TIME_PER_QUESTION = 10

export function SpeedQuizGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    if (selectedTopic) {
      const shuffled = shuffleArray(selectedTopic.words).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled)
    }
  }, [selectedTopic])

  const generateOptions = useCallback((correctWord: VocabularyWord, allWords: VocabularyWord[]) => {
    const wrongOptions = shuffleArray(
      allWords.filter((w) => w.english !== correctWord.english)
    )
      .slice(0, 3)
      .map((w) => w.vietnamese)
    return shuffleArray([correctWord.vietnamese, ...wrongOptions])
  }, [])

  useEffect(() => {
    if (questions.length > 0 && selectedTopic) {
      setOptions(generateOptions(questions[currentIndex], selectedTopic.words))
      setTimerKey((prev) => prev + 1)
    }
  }, [currentIndex, questions, selectedTopic, generateOptions])

  const handleTimeUp = useCallback(() => {
    if (selectedOption === null) {
      setIsCorrect(false)
      setStreak(0)
      addLearnedWord(questions[currentIndex], false)

      setTimeout(() => {
        if (currentIndex < TOTAL_QUESTIONS - 1) {
          setCurrentIndex((prev) => prev + 1)
          setSelectedOption(null)
          setIsCorrect(null)
        } else {
          setScreen('results')
        }
      }, 1000)
    }
  }, [selectedOption, currentIndex, questions, addLearnedWord, setScreen])

  const handleSelect = (option: string) => {
    if (selectedOption) return

    const correct = option === questions[currentIndex].vietnamese
    setSelectedOption(option)
    setIsCorrect(correct)

    if (correct) {
      const bonusPoints = Math.min(streak * 2, 10)
      addScore(10 + bonusPoints)
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }
    addLearnedWord(questions[currentIndex], correct)

    setTimeout(() => {
      if (currentIndex < TOTAL_QUESTIONS - 1) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedOption(null)
        setIsCorrect(null)
      } else {
        setScreen('results')
      }
    }, 800)
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Speed Quiz"
      currentQuestion={currentIndex + 1}
      totalQuestions={TOTAL_QUESTIONS}
      showTimer
      timerDuration={TIME_PER_QUESTION}
      onTimeUp={handleTimeUp}
    >
      <motion.div
        key={`${currentIndex}-${timerKey}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center"
      >
        {/* Streak indicator */}
        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2"
            >
              <Zap className="h-5 w-5 text-accent" />
              <span className="font-bold text-accent">{streak}x Streak!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Quick! What does this mean?
          </p>
          <h2 className="text-4xl font-bold text-foreground">{currentWord.english}</h2>
        </motion.div>

        {/* Options - 2x2 grid */}
        <div className="grid w-full grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedOption === option
            const isCorrectOption = option === currentWord.vietnamese
            const showResult = selectedOption !== null

            let bgColor = 'bg-card'
            let textColor = 'text-card-foreground'
            if (showResult) {
              if (isCorrectOption) {
                bgColor = 'bg-primary'
                textColor = 'text-primary-foreground'
              } else if (isSelected && !isCorrectOption) {
                bgColor = 'bg-destructive'
                textColor = 'text-destructive-foreground'
              }
            }

            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                whileHover={selectedOption === null ? { scale: 1.03 } : {}}
                whileTap={selectedOption === null ? { scale: 0.97 } : {}}
                className={`relative flex h-24 items-center justify-center overflow-hidden rounded-2xl p-4 shadow-lg transition-all ${bgColor} ${textColor}`}
              >
                <span className="text-center text-lg font-semibold">{option}</span>

                {showResult && isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2"
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                )}

                {showResult && isSelected && !isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2"
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Time's up message */}
        <AnimatePresence>
          {isCorrect === false && selectedOption === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 rounded-xl bg-destructive/20 px-6 py-3 text-destructive"
            >
              <span className="font-semibold">⏰ {"Time's up!"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GameWrapper>
  )
}
