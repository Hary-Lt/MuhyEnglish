'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useAppStore, type GameType } from '@/lib/app-store'
import { gameTypes } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { Button } from '@/components/ui/button'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export function GameMenuScreen() {
  const { selectedTopic, selectGame, setScreen } = useAppStore()

  const handleBack = () => {
    soundManager.playClick()
    setScreen('topics')
  }

  const handleSelectGame = (gameId: GameType) => {
    soundManager.playClick()
    selectGame(gameId)
  }

  if (!selectedTopic) return null

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mb-4 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-card active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-4">
            <motion.div 
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedTopic.color} shadow-lg`}
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl">{selectedTopic.icon}</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedTopic.name}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedTopic.words.length} words to learn
              </p>
            </div>
          </div>
        </motion.div>

        {/* Games List */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          Choose a Game
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {gameTypes.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => handleSelectGame(game.id as GameType)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

interface GameCardProps {
  game: {
    id: string
    name: string
    description: string
    icon: string
    color: string
  }
  onClick: () => void
}

function GameCard({ game, onClick }: GameCardProps) {
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-card p-4 text-left shadow-lg transition-all duration-300 hover:shadow-2xl"
    >
      {/* Soft gradient glow on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
      />

      {/* Icon */}
      <div
        className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} shadow-md transition-transform duration-300 group-hover:scale-105`}
      >
        <span className="text-2xl">{game.icon}</span>
      </div>

      {/* Content */}
      <div className="relative flex-1">
        <h3 className="font-semibold text-card-foreground">{game.name}</h3>
        <p className="text-sm text-muted-foreground">{game.description}</p>
      </div>

      {/* Arrow */}
      <motion.div
        className="relative text-muted-foreground transition-colors group-hover:text-primary"
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
      >
        <span className="text-xl">→</span>
      </motion.div>
    </motion.button>
  )
}
