'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/app-store'
import { topics, type Topic } from '@/lib/vocabulary-data'
import { soundManager } from '@/lib/sounds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export function TopicScreen() {
  const { selectTopic, goToWelcome } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBack = () => {
    soundManager.playClick()
    goToWelcome()
  }

  const handleSelectTopic = (topic: Topic) => {
    soundManager.playClick()
    selectTopic(topic)
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-xl transition-all duration-200 hover:scale-105 hover:bg-card active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Choose a Topic</h1>
            <p className="text-sm text-muted-foreground">
              {topics.length} topics available
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border-none bg-card pl-12 text-base shadow-lg transition-shadow focus:shadow-xl"
          />
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={() => handleSelectTopic(topic)} />
          ))}
        </motion.div>

        {filteredTopics.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-muted-foreground">No topics found</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-2xl"
    >
      {/* Soft gradient glow on hover */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 transition-opacity duration-300 group-hover:opacity-15`}
      />
      
      {/* Subtle ring effect */}
      <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/30" />
      
      {/* Icon */}
      <motion.span
        className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110"
      >
        {topic.icon}
      </motion.span>

      {/* Name */}
      <span className="text-center text-sm font-semibold text-card-foreground">
        {topic.name}
      </span>

      {/* Word count */}
      <span className="mt-1 text-xs text-muted-foreground">
        {topic.words.length} words
      </span>
    </motion.button>
  )
}
