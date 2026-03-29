'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useAppStore } from '@/lib/app-store'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const { soundEnabled, toggleSound, screen } = useAppStore()

  // Don't show header during gameplay (it has its own header)
  if (screen === 'playing') return null

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-foreground">VocabMaster</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className="rounded-xl"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-foreground" />
            ) : (
              <VolumeX className="h-5 w-5 text-foreground" />
            )}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
