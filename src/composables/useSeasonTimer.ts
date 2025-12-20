import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { leaderboardService } from '@/api/leaderboardService'
import type { Season } from '@/api/types'

export function useSeasonTimer() {
  const season = ref<Season | null>(null)
  const timeLeft = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  let timerInterval: ReturnType<typeof setInterval> | null = null

  const timeLeftLabel = computed(() => {
    if (timeLeft.value.expired) return 'Season ended'
    const { days, hours, minutes, seconds } = timeLeft.value
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  })

  const updateTimeLeft = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now

    if (diff <= 0) {
      timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
      if (timerInterval) clearInterval(timerInterval)
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    timeLeft.value = { days, hours, minutes, seconds, expired: false }
  }

  const startTimer = (endTime: string) => {
    updateTimeLeft(endTime)
    timerInterval = setInterval(() => updateTimeLeft(endTime), 1000)
  }

  const fetchSeason = async () => {
    const res = await leaderboardService.getSeason()
    season.value = res.data.season
    startTimer(res.data.season.end)
  }

  onMounted(fetchSeason)

  onBeforeUnmount(() => {
    if (timerInterval) clearInterval(timerInterval)
  })

  return { season, timeLeft, timeLeftLabel }
}
