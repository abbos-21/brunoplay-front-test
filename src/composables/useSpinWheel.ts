import { ref, computed, onUnmounted } from 'vue'
import { gameService } from '@/api/gameService'
import { toast } from 'vue3-toastify'

const canSpin = ref(false)
const lastPrize = ref<number | null>(null)
const isSpinning = ref(false)

const remainingSeconds = ref<number | null>(null)

let timer: number | null = null

export function useSpinWheel() {
  const cooldownRemaining = computed(() => {
    if (remainingSeconds.value === null || remainingSeconds.value <= 0) return null

    const hours = Math.floor(remainingSeconds.value / 3600)
    const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
    const seconds = remainingSeconds.value % 60

    return { hours, minutes, seconds }
  })

  const stopTimer = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  const onCooldownFinished = async () => {
    stopTimer()
    remainingSeconds.value = 0
    canSpin.value = true
    lastPrize.value = null

    await fetchStatus()
  }

  const startTimer = () => {
    stopTimer()

    if (remainingSeconds.value === null || remainingSeconds.value <= 0) return

    timer = window.setInterval(() => {
      if (remainingSeconds.value !== null) {
        remainingSeconds.value--

        if (remainingSeconds.value <= 0) {
          onCooldownFinished()
        }
      }
    }, 1000)
  }

  const fetchStatus = async () => {
    try {
      const res = await gameService.getSpinWheelStatus()

      canSpin.value = res.data.canSpin

      if (res.data.remaining) {
        const { hours, minutes, seconds } = res.data.remaining
        remainingSeconds.value = hours * 3600 + minutes * 60 + seconds
        startTimer()
      } else {
        remainingSeconds.value = null
        stopTimer()
      }
    } catch (err) {
      console.error('Failed to fetch spin status:', err)
    }
  }

  const spin = async () => {
    if (!canSpin.value || isSpinning.value) return null
    isSpinning.value = true

    try {
      const res = await gameService.spinWheel()
      lastPrize.value = res.data.prize
      canSpin.value = false
      setTimeout(() => {
        toast.success(`You won ${lastPrize.value} coins! Keep going!`)
      }, 4000)
      await fetchStatus()
      return res.data
    } catch (err) {
      console.error('Spin failed:', err)
      throw err
    } finally {
      isSpinning.value = false
    }
  }

  onUnmounted(() => {
    stopTimer()
  })

  return {
    canSpin,
    isSpinning,
    cooldownRemaining,
    lastPrize,
    fetchStatus,
    spin,
  }
}
