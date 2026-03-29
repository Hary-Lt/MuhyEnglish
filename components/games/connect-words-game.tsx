'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/app-store'
import { shuffleArray, type VocabularyWord } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { GameWrapper } from './game-wrapper'
import { Check } from 'lucide-react'

const WORDS_PER_ROUND = 5
const GAME_TIME = 60

export function ConnectWordsGame() {
  const { selectedTopic, addScore, addLearnedWord, setScreen, soundEnabled } = useAppStore()
  const [round, setRound] = useState(0)
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [englishWords, setEnglishWords] = useState<VocabularyWord[]>([])
  const [vietnameseWords, setVietnameseWords] = useState<VocabularyWord[]>([])
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const [correctPair, setCorrectPair] = useState<string | null>(null)
  const totalRounds = 2

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (selectedTopic) {
      const shuffled = shuffleArray(selectedTopic.words).slice(0, WORDS_PER_ROUND * totalRounds)
      setWords(shuffled)
    }
  }, [selectedTopic])

  useEffect(() => {
    if (words.length > 0) {
      const roundWords = words.slice(
        round * WORDS_PER_ROUND,
        (round + 1) * WORDS_PER_ROUND
      )
      setEnglishWords(shuffleArray(roundWords))
      setVietnameseWords(shuffleArray(roundWords))
      setMatchedPairs(new Set())
      setSelectedEnglish(null)
    }
  }, [round, words])

  const handleTimeUp = useCallback(() => {
    setScreen('results')
  }, [setScreen])

  const handleEnglishClick = (word: string) => {
    if (matchedPairs.has(word)) return
    soundManager.playClick()
    setSelectedEnglish(word)
    setWrongPair(null)
  }

  const handleVietnameseClick = (word: VocabularyWord) => {
    if (!selectedEnglish || matchedPairs.has(word.english)) return

    const isCorrect = selectedEnglish === word.english

    if (isCorrect) {
      soundManager.playCorrect()
      addScore(10)
      setCorrectPair(word.english)
      setMatchedPairs((prev) => new Set([...prev, word.english]))
      addLearnedWord(word, true)

      setTimeout(() => {
        setCorrectPair(null)
        // Check if round complete
        if (matchedPairs.size + 1 === WORDS_PER_ROUND) {
          if (round < totalRounds - 1) {
            setRound((prev) => prev + 1)
          } else {
            setScreen('results')
          }
        }
      }, 400)
    } else {
      soundManager.playWrong()
      setWrongPair(word.english)
      addLearnedWord(word, false)
      setTimeout(() => setWrongPair(null), 400)
    }

    setSelectedEnglish(null)
  }

  if (!selectedTopic || words.length === 0) return null

  return (
    <GameWrapper
      title="Connect Words"
      currentQuestion={round * WORDS_PER_ROUND + matchedPairs.size + 1}
      totalQuestions={WORDS_PER_ROUND * totalRounds}
      showTimer
      timerDuration={GAME_TIME}
      onTimeUp={handleTimeUp}
    >
      <motion.div
        key={round}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center text-muted-foreground"
        >
          Match the English words with their Vietnamese translations
        </motion.p>

        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {/* English Column */}
          <div className="space-y-3">
            <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground">
              English
            </h3>
            <AnimatePresence mode="popLayout">
              {englishWords.map((word, index) => {
                const isMatched = matchedPairs.has(word.english)
                const isSelected = selectedEnglish === word.english
                const isCorrectAnimation = correctPair === word.english

                return (
                  <motion.button
                    key={word.english}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isCorrectAnimation ? [1, 1.05, 1] : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => handleEnglishClick(word.english)}
                    disabled={isMatched}
                    whileHover={!isMatched ? { scale: 1.03, y: -2 } : {}}
                    whileTap={!isMatched ? { scale: 0.97 } : {}}
                    className={`relative w-full rounded-2xl p-4 text-center font-semibold shadow-lg transition-all duration-200 ${
                      isMatched
                        ? 'bg-primary/20 text-primary shadow-primary/20'
                        : isSelected
                        ? 'border-2 border-primary bg-primary/10 text-primary shadow-primary/30'
                        : 'border-2 border-transparent bg-card text-card-foreground hover:shadow-xl'
                    }`}
                  >
                    {word.english}
                    {isMatched && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Vietnamese Column */}
          <div className="space-y-3">
            <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground">
              Vietnamese
            </h3>
            <AnimatePresence mode="popLayout">
              {vietnameseWords.map((word, index) => {
                const isMatched = matchedPairs.has(word.english)
                const isWrong = wrongPair === word.english
                const isCorrectAnimation = correctPair === word.english

                return (
                  <motion.button
                    key={word.english}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isCorrectAnimation ? [1, 1.05, 1] : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => handleVietnameseClick(word)}
                    disabled={isMatched || !selectedEnglish}
                    whileHover={!isMatched && selectedEnglish ? { scale: 1.03, y: -2 } : {}}
                    whileTap={!isMatched && selectedEnglish ? { scale: 0.97 } : {}}
                    className={`relative w-full rounded-2xl p-4 text-center font-semibold shadow-lg transition-all duration-200 ${
                      isMatched
                        ? 'bg-primary/20 text-primary shadow-primary/20'
                        : isWrong
                        ? 'animate-shake border-2 border-destructive bg-destructive/20 text-destructive'
                        : selectedEnglish
                        ? 'border-2 border-transparent bg-card text-card-foreground hover:shadow-xl'
                        : 'border-2 border-transparent bg-card text-card-foreground opacity-60'
                    }`}
                  >
                    {word.vietnamese}
                    {isMatched && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </GameWrapper>
  )
}
