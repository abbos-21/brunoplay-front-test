<script setup lang="ts">
import { starsService } from '@/api/starsService'
import { onMounted, ref, computed } from 'vue'
import { PopupBackgroundImage } from '@/assets/backgrounds/winter'
import { BoxCoinButtonImage, BoxStarButtonImage, MenuItemBackground } from '@/assets/images/winter'
import WebApp from '@twa-dev/sdk'
import { boxService } from '@/api/boxService'

import LoaderComponent from '@/components/LoaderComponent.vue'
import type { BoxReward } from '@/api/types'

/* -------------------- State -------------------- */

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

/* Cards should be clickable only if user can play and game not finished */
const cardsDisabled = computed(() => !canPlay.value || gameFinished.value)

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

  cards.value.forEach((c) => (c.flipped = false))
}

function openCard(card: { flipped: boolean; reward: BoxReward }) {
  if (cardsDisabled.value) return
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
  if (!canClaim.value) return

  try {
    loading.value = true
    await boxService.rewardUser({
      rewardIds: selectedRewardIds.value,
    })

    // Game finished → disable cards & show buy buttons
    gameFinished.value = true
    canClaim.value = false
    canPlay.value = false
  } catch (error) {
    console.error('Failed to claim rewards:', error)
  } finally {
    loading.value = false
  }
}

/* -------------------- Box API -------------------- */

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

  if (canPlay.value) {
    await loadRewards()
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

  // Always load cards (even disabled)
  await loadRewards()
})
</script>

<template>
  <LoaderComponent v-if="loading" />

  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 py-8 relative flex flex-col gap-6"
    :style="{ backgroundImage: `url(${PopupBackgroundImage})` }"
  >
    <h1 class="text-center text-white font-bold text-xl">Choose and get your reward</h1>

    <!-- Buy buttons (top, after claim or when cannot play) -->
    <div class="grid grid-cols-2 gap-4 px-4" v-if="!canPlay">
      <button type="button" @click="payWithCoins">
        <img :src="BoxCoinButtonImage" />
      </button>

      <button type="button" @click="openInvoice">
        <img :src="BoxStarButtonImage" />
      </button>
    </div>

    <!-- Cards (always visible) -->
    <div class="grid grid-cols-3 gap-x-4 gap-y-6 px-4">
      <div
        v-for="card in cards"
        :key="card.id"
        class="flip-card"
        :class="{
          'pointer-events-none opacity-60': cardsDisabled,
        }"
        @click="openCard(card)"
      >
        <div class="flip-card-inner" :class="{ flipped: card.flipped }">
          <div class="flip-card-front">
            <img :src="MenuItemBackground" class="w-full h-full object-cover" />
          </div>

          <div class="flip-card-back">
            <h2 class="text-white font-bold">
              {{ card.reward.name }}
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim button -->
    <div v-if="canClaim" class="flex justify-center">
      <button class="px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold" @click="claimRewards">
        Claim
      </button>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  perspective: 1000px;
  width: 100%;
  aspect-ratio: 4 / 3;
  cursor: pointer;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
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
}

.flip-card-back {
  transform: rotateY(180deg);
  background: rgba(0, 146, 184, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
