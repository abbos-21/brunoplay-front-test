// stores/music.ts
import { ref } from 'vue'

export const isMusicPlaying = ref(false)
export const isMusicEnabled = ref(true)
export const isMusicAvailable = ref(true)
export const audioElement = ref<HTMLAudioElement | null>(null) // ← Add this

export const toggleMusic = () => {
  if (!isMusicAvailable.value) {
    isMusicEnabled.value = true
    return true
  }
  isMusicEnabled.value = !isMusicEnabled.value

  // Sync with actual audio
  if (audioElement.value) {
    if (isMusicEnabled.value) {
      audioElement.value.play().catch(() => {
        console.log('Playback failed')
        setMusicAvailable(false)
      })
    } else {
      audioElement.value.pause()
    }
  }

  return isMusicEnabled.value
}

export const setMusicPlaying = (playing: boolean) => {
  isMusicPlaying.value = playing
}

export const setMusicEnabled = (enabled: boolean) => {
  isMusicEnabled.value = enabled
  if (audioElement.value) {
    if (enabled) {
      audioElement.value.play().catch(() => setMusicAvailable(false))
    } else {
      audioElement.value.pause()
    }
  }
}

export const setMusicAvailable = (available: boolean) => {
  isMusicAvailable.value = available
  if (!available) {
    isMusicEnabled.value = false
    isMusicPlaying.value = false
    if (audioElement.value) audioElement.value.pause()
  }
}

// Export setter for audio ref
export const setAudioElement = (el: HTMLAudioElement | null) => {
  audioElement.value = el
}
