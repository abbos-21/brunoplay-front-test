// src/composables/useBoxGame.ts
import { starsService } from '@/api/starsService'
import { boxService } from '@/api/boxService'
import { onMounted, ref } from 'vue'
import WebApp from '@twa-dev/sdk'
import type { BoxReward } from '@/api/types'

export function useBoxGame() {
  const loading = ref(false)
  const canPlay = ref(false)
  const rewardList = ref<BoxReward[] | null>(null)
  const invoiceLink = ref<string | null>(null)
  const MAX_OPENS = 3
  const openedCount = ref(0)
  const selectedRewardIds = ref<number[]>([])
  const canClaim = ref(false)
  const gameFinished = ref(false)
  const cards = ref<
    Array<{
      id: number
      reward: BoxReward
      flipped: boolean
    }>
  >([])

  /* -------------------- Payments -------------------- */

  async function getInvoiceLink() {
    try {
      const response = await starsService.getInvoiceLink()
      invoiceLink.value = response.data.invoiceLink
    } catch (error) {
      console.error('Failed to get invoice link:', error)
    }
  }

  function openInvoice() {
    if (!invoiceLink.value) return

    WebApp.openInvoice(invoiceLink.value, (status) => {
      if (status === 'paid') {
        alert('You paid!')
      }
    })
  }

  /* -------------------- Game logic -------------------- */

  function resetGameState() {
    openedCount.value = 0
    selectedRewardIds.value = []
    canClaim.value = false
    gameFinished.value = false
  }

  function openCard(card: { flipped: boolean; reward: BoxReward }) {
    if (gameFinished.value) return
    if (card.flipped) return
    if (openedCount.value >= MAX_OPENS) return

    card.flipped = true
    openedCount.value++
    selectedRewardIds.value.push(card.reward.id)

    if (openedCount.value === MAX_OPENS) {
      canClaim.value = true
    }
  }

  async function claimRewards() {
    if (!canClaim.value || gameFinished.value) return

    try {
      loading.value = true
      await boxService.rewardUser({
        rewardIds: selectedRewardIds.value,
      })

      gameFinished.value = true
      canClaim.value = false
      cards.value = []

      const response = await boxService.getStatus()
      canPlay.value = response.data.user.canPlayBox
    } catch (error) {
      console.error('Failed to claim rewards:', error)
    } finally {
      loading.value = false
    }
  }

  /* -------------------- Box API -------------------- */

  async function payWithCoins() {
    try {
      loading.value = true
      await boxService.payWithCoins()
    } catch (error) {
      console.log(error)
    } finally {
      const response = await boxService.getStatus()
      canPlay.value = response.data.user.canPlayBox
      loading.value = false
    }

    if (!canPlay.value) return

    await loadRewards()
  }

  async function loadRewards() {
    try {
      loading.value = true
      const response = await boxService.getRewards()
      rewardList.value = response.data.rewardList
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }

    if (rewardList.value) {
      resetGameState()

      cards.value = rewardList.value.map((reward, index) => ({
        id: index + 1,
        reward,
        flipped: false,
      }))
    }
  }

  /* -------------------- Init -------------------- */

  onMounted(async () => {
    try {
      loading.value = true
      await getInvoiceLink()

      const response = await boxService.getStatus()
      canPlay.value = response.data.user.canPlayBox

      if (canPlay.value) {
        cards.value = [] // ← Force clear old cards
        await loadRewards() // ← Always reload fresh
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  })

  return {
    loading,
    canPlay,
    cards,
    openedCount,
    openCard,
    canClaim,
    claimRewards,
    payWithCoins,
    openInvoice,
  }
}
