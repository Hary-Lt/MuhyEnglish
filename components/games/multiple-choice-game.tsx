'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { GameWrapper } from './game-wrapper'
import { Check, X } from 'lucide-react'

const TOTAL_QUESTIONS = 10
const TIME_PER_QUESTION = 5

export function MultipleChoiceGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<VocabularyWord[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [timerKey, setTimerKey] = useState(0)
  const [showFlash, setShowFlash] = useState<'correct' | 'wrong' | null>(null)

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (selectedTopic) {
      const shuffled = shuffleArray(selectedTopic.words).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled)
    }
  }, [selectedTopic])

  const generateOptions = useCallback((correctWord: VocabularyWord, allWords: VocabularyWord[]) => {
    const wrongOptions = shuffleArray(
      allWords.filter((w) => w.english !== correctWord.english)
    ).slice(0, 3)
    return shuffleArray([correctWord, ...wrongOptions])
  }, [])

  useEffect(() => {
    if (questions.length > 0 && selectedTopic) {
      setOptions(generateOptions(questions[currentIndex], selectedTopic.words))
      setTimerKey((prev) => prev + 1)
    }
  }, [currentIndex, questions, selectedTopic, generateOptions])

  const moveToNext = useCallback(() => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsCorrect(null)
      setShowFlash(null)
    } else {
      setScreen('results')
    }
  }, [currentIndex, setScreen])

  const handleTimeUp = useCallback(() => {
    if (selectedOption !== null) return
    
    soundManager.playWrong()
    setIsCorrect(false)
    setShowFlash('wrong')
    addLearnedWord(questions[currentIndex], false)
    
    setTimeout(moveToNext, 600)
  }, [selectedOption, currentIndex, questions, addLearnedWord, moveToNext])

  const handleSelect = (option: VocabularyWord) => {
    if (selectedOption) return

    const correct = option.english === questions[currentIndex].english
    setSelectedOption(option.english)
    setIsCorrect(correct)

    if (correct) {
      soundManager.playCorrect()
      addScore(10)
      setShowFlash('correct')
    } else {
      soundManager.playWrong()
      setShowFlash('wrong')
    }
    addLearnedWord(questions[currentIndex], correct)

    // Fast transition to next question
    setTimeout(moveToNext, 500)
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Multiple Choice"
      currentQuestion={currentIndex + 1}
      totalQuestions={TOTAL_QUESTIONS}
      showTimer
      timerDuration={TIME_PER_QUESTION}
      onTimeUp={handleTimeUp}
      timerKey={timerKey}
    >
      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-none fixed inset-0 z-50 ${
              showFlash === 'correct' ? 'bg-primary/20' : 'bg-destructive/20'
            }`}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.2 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center"
      >
        {/* Question */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-8 text-center"
        >
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            What is the Vietnamese translation of:
          </p>
          <h2 className="text-4xl font-bold text-foreground">{currentWord.english}</h2>
          {currentWord.pronunciation && (
            <p className="mt-2 text-lg text-muted-foreground">{currentWord.pronunciation}</p>
          )}
        </motion.div>

        {/* Options */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === option.english
            const isCorrectOption = option.english === currentWord.english
            const showResult = selectedOption !== null

            let bgColor = 'bg-card'
            let borderColor = 'border-transparent'
            if (showResult) {
              if (isCorrectOption) {
                bgColor = 'bg-primary/20'
                borderColor = 'border-primary'
              } else if (isSelected && !isCorrectOption) {
                bgColor = 'bg-destructive/20'
                borderColor = 'border-destructive'
              }
            }

            return (
              <motion.button
                key={option.english}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.15 }}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                whileHover={selectedOption === null ? { scale: 1.03, y: -2 } : {}}
                whileTap={selectedOption === null ? { scale: 0.97 } : {}}
                className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left shadow-lg transition-all duration-200 ${bgColor} ${borderColor} ${
                  selectedOption === null ? 'hover:shadow-xl' : ''
                }`}
              >
                <span className="text-lg font-semibold text-card-foreground">
                  {option.vietnamese}
                </span>

                {showResult && isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                  </motion.div>
                )}

                {showResult && isSelected && !isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                      <X className="h-5 w-5" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </GameWrapper>
  )
}
