'use client'

// Web Audio API for smooth sound effects
class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      // Smooth fade in and out
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Silently fail if audio not supported
    }
  }

  playClick() {
    this.playTone(800, 0.08, 'sine', 0.15)
  }

  playCorrect() {
    if (!this.enabled) return
    
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Play ascending chord (C, E, G)
      const frequencies = [523.25, 659.25, 783.99]
      
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, now)

        gainNode.gain.setValueAtTime(0, now + i * 0.05)
        gainNode.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.02)
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3)

        oscillator.start(now + i * 0.05)
        oscillator.stop(now + 0.35)
      })
    } catch {
      // Silently fail
    }
  }

  playWrong() {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Play dissonant buzz
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, now)
      oscillator.frequency.linearRampToValueAtTime(150, now + 0.15)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15)

      oscillator.start(now)
      oscillator.stop(now + 0.2)
    } catch {
      // Silently fail
    }
  }

  playSuccess() {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Celebratory ascending scale
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99]
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, now)

        const startTime = now + i * 0.08
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02)
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.15)

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.2)
      })
    } catch {
      // Silently fail
    }
  }

  playFlip() {
    this.playTone(600, 0.06, 'sine', 0.1)
  }

  playMatch() {
    if (!this.enabled) return
    
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // Quick ding
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now)
      oscillator.frequency.linearRampToValueAtTime(1200, now + 0.1)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15)

      oscillator.start(now)
      oscillator.stop(now + 0.2)
    } catch {
      // Silently fail
    }
  }
}

export const soundManager = new SoundManager()
