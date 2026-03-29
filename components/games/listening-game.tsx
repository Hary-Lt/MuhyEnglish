'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { GameWrapper } from './game-wrapper'
import { Button } from '@/components/ui/button'
import { Volume2, Check, X } from 'lucide-react'

const TOTAL_QUESTIONS = 10

export function ListeningGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [options, setOptions] = useState<VocabularyWord[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)

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
      setHasPlayed(false)
    }
  }, [currentIndex, questions, selectedTopic, generateOptions])

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(questions[currentIndex].english)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
      setHasPlayed(true)
    }
  }

  const handleSelect = (option: VocabularyWord) => {
    if (selectedOption) return

    const correct = option.english === questions[currentIndex].english
    setSelectedOption(option.english)
    setIsCorrect(correct)

    if (correct) {
      addScore(12)
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
    }, 1200)
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Listening Challenge"
      currentQuestion={currentIndex + 1}
      totalQuestions={TOTAL_QUESTIONS}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center"
      >
        {/* Play button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <Button
            size="lg"
            onClick={speakWord}
            className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-emerald-400 shadow-2xl shadow-primary/30 transition-transform hover:scale-105"
          >
            <Volume2 className="h-12 w-12 text-primary-foreground" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center text-muted-foreground"
        >
          {hasPlayed ? 'Tap again to replay' : 'Tap the speaker to hear the word'}
        </motion.p>

        {/* Options */}
        <div className="grid w-full grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedOption === option.english
            const isCorrectOption = option.english === currentWord.english
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
                key={option.english}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null || !hasPlayed}
                whileHover={selectedOption === null && hasPlayed ? { scale: 1.02 } : {}}
                whileTap={selectedOption === null && hasPlayed ? { scale: 0.98 } : {}}
                className={`relative overflow-hidden rounded-2xl p-4 shadow-lg transition-all ${bgColor} ${textColor} ${
                  !hasPlayed ? 'opacity-50' : ''
                }`}
              >
                <span className="block text-lg font-semibold">{option.english}</span>
                <span className="block text-sm opacity-70">{option.vietnamese}</span>

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

        {/* Feedback */}
        <AnimatePresence>
          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 rounded-xl px-6 py-3 ${
                isCorrect ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
              }`}
            >
              <span className="font-semibold">
                {isCorrect ? '🎉 Great listening!' : `❌ It was "${currentWord.english}"`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GameWrapper>
  )
}
