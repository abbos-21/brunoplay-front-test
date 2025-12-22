<script setup lang="ts">
import { starsService } from '@/api/starsService'
import { onMounted, ref } from 'vue'
import { PopupBackgroundImage } from '@/assets/backgrounds/winter'
import { BoxCoinButtonImage, BoxStarButtonImage, MenuItemBackground } from '@/assets/images/winter'
import WebApp from '@twa-dev/sdk'
import { boxService } from '@/api/boxService'

import LoaderComponent from '@/components/LoaderComponent.vue'
import type { BoxReward } from '@/api/types'

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
    cards.value = [] // hide cards after claim
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
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }

  if (canPlay.value) {
    await loadRewards()
  }
})
</script>

<template>
  <LoaderComponent v-if="loading" />

  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 py-8 relative flex flex-col gap-8"
    :style="{ backgroundImage: `url(${PopupBackgroundImage})` }"
  >
    <h1 class="text-center text-white font-bold text-xl">Choose and get your reward</h1>

    <!-- Cards -->
    <div v-if="cards.length > 0" class="grid grid-cols-3 gap-x-4 gap-y-6 px-4">
      <div
        v-for="card in cards"
        :key="card.id"
        class="flip-card"
        :class="{ 'pointer-events-none': openedCount >= MAX_OPENS && !card.flipped }"
        @click="openCard(card)"
      >
        <div class="flip-card-inner" :class="{ flipped: card.flipped }">
          <div class="flip-card-front">
            <img :src="MenuItemBackground" alt="Gift box" class="w-full h-full object-cover" />
          </div>

          <div class="flip-card-back">
            <div class="h-full text-center flex flex-col">
              <h2 class="text-white font-bold my-auto">
                {{ card.reward.name }}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim button -->
    <div v-if="canClaim" class="flex justify-center">
      <button
        type="button"
        class="px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold"
        @click="claimRewards"
      >
        Claim
      </button>
    </div>

    <!-- Buy buttons -->
    <div class="grid grid-cols-2 gap-4" v-if="!canPlay">
      <button type="button" @click="payWithCoins">
        <img :src="BoxCoinButtonImage" alt="buy-with-coins" />
      </button>

      <button type="button" @click="openInvoice">
        <img :src="BoxStarButtonImage" alt="buy-with-stars" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  background-color: transparent;
  perspective: 1000px;
  cursor: pointer;
  width: 100%;
  aspect-ratio: 4 / 3;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d;
  border-radius: 12px;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.flip-card-back {
  background-color: rgba(0, 146, 184, 0.5);
  color: white;
  border: 1px solid white;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
