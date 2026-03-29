'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { GameWrapper } from './game-wrapper'
import { Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TOTAL_QUESTIONS = 10
const TIME_PER_QUESTION = 15

interface ScrambledLetter {
  id: string
  letter: string
  isUsed: boolean
}

export function WordBuilderGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<VocabularyWord[]>([])
  const [scrambledLetters, setScrambledLetters] = useState<ScrambledLetter[]>([])
  const [builtWord, setBuiltWord] = useState<ScrambledLetter[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (selectedTopic) {
      // Filter words with reasonable length (4-10 characters)
      const suitableWords = selectedTopic.words.filter(
        (w) => w.english.length >= 4 && w.english.length <= 10
      )
      const shuffled = shuffleArray(suitableWords).slice(0, TOTAL_QUESTIONS)
      setQuestions(shuffled)
    }
  }, [selectedTopic])

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const word = questions[currentIndex].english.toLowerCase()
      const letters = shuffleArray(
        word.split('').map((letter, idx) => ({
          id: `${letter}-${idx}`,
          letter,
          isUsed: false,
        }))
      )
      setScrambledLetters(letters)
      setBuiltWord([])
      setIsCorrect(null)
      setShowResult(false)
      setTimerKey((prev) => prev + 1)
    }
  }, [currentIndex, questions])

  const moveToNext = useCallback(() => {
    if (currentIndex < TOTAL_QUESTIONS - 1 && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setScreen('results')
    }
  }, [currentIndex, questions.length, setScreen])

  const handleTimeUp = useCallback(() => {
    if (showResult) return
    
    soundManager.playWrong()
    setIsCorrect(false)
    setShowResult(true)
    addLearnedWord(questions[currentIndex], false)
    
    setTimeout(moveToNext, 1000)
  }, [showResult, currentIndex, questions, addLearnedWord, moveToNext])

  const handleLetterClick = (letter: ScrambledLetter) => {
    if (letter.isUsed || showResult) return
    
    soundManager.playClick()
    
    // Add letter to built word
    setBuiltWord((prev) => [...prev, letter])
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === letter.id ? { ...l, isUsed: true } : l))
    )

    // Check if word is complete
    const newBuiltWord = [...builtWord, letter]
    const currentWord = questions[currentIndex].english.toLowerCase()
    
    if (newBuiltWord.length === currentWord.length) {
      const attemptedWord = newBuiltWord.map((l) => l.letter).join('')
      const correct = attemptedWord === currentWord
      
      setIsCorrect(correct)
      setShowResult(true)
      
      if (correct) {
        soundManager.playCorrect()
        addScore(15)
      } else {
        soundManager.playWrong()
      }
      addLearnedWord(questions[currentIndex], correct)
      
      setTimeout(moveToNext, 800)
    }
  }

  const handleBuiltLetterClick = (letter: ScrambledLetter, index: number) => {
    if (showResult) return
    
    soundManager.playClick()
    
    // Remove letter from built word
    setBuiltWord((prev) => prev.filter((_, i) => i !== index))
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === letter.id ? { ...l, isUsed: false } : l))
    )
  }

  const handleReset = () => {
    soundManager.playClick()
    setBuiltWord([])
    setScrambledLetters((prev) => prev.map((l) => ({ ...l, isUsed: false })))
  }

  if (!selectedTopic || questions.length === 0) return null

  const currentWord = questions[currentIndex]

  return (
    <GameWrapper
      title="Word Builder"
      currentQuestion={currentIndex + 1}
      totalQuestions={Math.min(TOTAL_QUESTIONS, questions.length)}
      showTimer
      timerDuration={TIME_PER_QUESTION}
      onTimeUp={handleTimeUp}
      timerKey={timerKey}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center"
      >
        {/* Vietnamese hint */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 text-center"
        >
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Build the English word for:
          </p>
          <h2 className="text-3xl font-bold text-foreground">{currentWord.vietnamese}</h2>
        </motion.div>

        {/* Built word area */}
        <div className="mb-6 flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-card p-4 shadow-lg">
          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence mode="popLayout">
              {builtWord.length === 0 ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-muted-foreground"
                >
                  Tap letters below...
                </motion.span>
              ) : (
                builtWord.map((letter, index) => (
                  <motion.button
                    key={`built-${letter.id}-${index}`}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={() => handleBuiltLetterClick(letter, index)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.1 } : {}}
                    whileTap={!showResult ? { scale: 0.9 } : {}}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold uppercase shadow-md transition-all ${
                      showResult
                        ? isCorrect
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-destructive text-destructive-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {letter.letter}
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scrambled letters */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {scrambledLetters.map((letter, index) => (
            <motion.button
              key={letter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: letter.isUsed ? 0.3 : 1, 
                scale: letter.isUsed ? 0.9 : 1,
              }}
              transition={{ delay: index * 0.03, duration: 0.15 }}
              onClick={() => handleLetterClick(letter)}
              disabled={letter.isUsed || showResult}
              whileHover={!letter.isUsed && !showResult ? { scale: 1.1, y: -4 } : {}}
              whileTap={!letter.isUsed && !showResult ? { scale: 0.9 } : {}}
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold uppercase shadow-lg transition-all ${
                letter.isUsed
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-card text-card-foreground hover:shadow-xl'
              }`}
            >
              {letter.letter}
            </motion.button>
          ))}
        </div>

        {/* Reset button */}
        {builtWord.length > 0 && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </motion.div>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-4 flex items-center gap-2 rounded-xl px-6 py-3 ${
                isCorrect ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
              }`}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">Perfect!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span className="font-semibold">
                    Correct: {currentWord.english}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GameWrapper>
  )
}
