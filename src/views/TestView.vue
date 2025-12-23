<script setup lang="ts">
import { PopupBackgroundImage } from '@/assets/backgrounds/winter'
import {
  BoxClaimButtonImage,
  BoxCoinButtonImage,
  BoxStarButtonImage,
  MenuItemBackground,
} from '@/assets/images/winter'
import LoaderComponent from '@/components/LoaderComponent.vue'
import { useBoxGame } from '@/composables/useBoxGame'

const {
  loading,
  canPlay,
  cards,
  openedCount,
  openCard,
  canClaim,
  claimRewards,
  payWithCoins,
  openInvoice,
} = useBoxGame()
</script>

<template>
  <LoaderComponent v-if="loading" />

  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 py-8 relative flex flex-col gap-8 overflow-y-scroll scrollbar-hide"
    :style="{ backgroundImage: `url(${PopupBackgroundImage})` }"
  >
    <h1 class="text-center text-white font-bold text-xl">Choose and get your reward</h1>

    <!-- Cards -->
    <div v-if="cards.length > 0" class="grid grid-cols-3 gap-x-4 gap-y-6 px-4">
      <div
        v-for="card in cards"
        :key="card.id"
        class="flip-card"
        :class="{ 'pointer-events-none': openedCount >= 3 && !card.flipped }"
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

    <div v-if="!canPlay" class="grid grid-cols-3 gap-x-4 gap-y-6 px-4 opacity-50">
      <div v-for="n in 12" :key="n" class="pointer-events-none aspect-4/3">
        <img :src="MenuItemBackground" alt="Gift box" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Claim button -->
    <div v-if="canClaim" class="flex justify-center w-full">
      <button type="button" @click="claimRewards" style="width: calc(50% - 8px)">
        <img :src="BoxClaimButtonImage" alt="claim-rewards" class="w-full" />
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
