<script setup lang="ts">
import { starsService } from '@/api/starsService'
import { onMounted, ref } from 'vue'
import { PopupBackgroundImage } from '@/assets/backgrounds/winter'
import { BoxCoinButtonImage, BoxStarButtonImage, MenuItemBackground } from '@/assets/images/winter'

const invoiceLink = ref<string | null>(null)

async function getInvoiceLink() {
  try {
    const response = await starsService.getInvoiceLink()
    invoiceLink.value = response.data.invoiceLink
  } catch (error) {
    console.error('Failed to get invoice link:', error)
  }
}

const rewards = [
  { id: 1, name: 'Energy Refill', chance: 26.6 },
  { id: 2, name: 'Health Refill', chance: 26.0 },
  { id: 3, name: '3000 Coins', chance: 26.0 },
  { id: 4, name: '5000 Coins', chance: 10.0 },
  { id: 5, name: '7000 Coins', chance: 5.0 },
  { id: 6, name: '10000 Coins', chance: 3.0 },
  { id: 7, name: '20000 Coins', chance: 2.0 },
  { id: 8, name: '50000 Coins', chance: 0.6 },
  { id: 9, name: '75000 Coins', chance: 0.5 },
  { id: 10, name: '100000 Coins', chance: 0.1 },
  { id: 11, name: '100 Stars', chance: 0.1 },
  { id: 12, name: 'Gift', chance: 0.1 },
]

function weightedRoll(items: typeof rewards) {
  const total = items.reduce((sum, i) => sum + i.chance, 0)
  let roll = Math.random() * total

  for (const item of items) {
    roll -= item.chance
    if (roll <= 0) return item
  }

  return items[items.length - 1]
}

function generateRewards(items: typeof rewards, count: number) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(weightedRoll(items))
  }
  return result
}

// Reactive array of cards with reward info
const cards = ref<
  Array<{
    id: number
    reward: { id: number; name: string }
    flipped: boolean
  }>
>([])

function toggleFlip(card: { flipped: boolean }) {
  card.flipped = !card.flipped
}

onMounted(async () => {
  await getInvoiceLink()

  const N = 12
  const rewardList = generateRewards(rewards, N)

  cards.value = rewardList.map((reward, index) => ({
    id: index + 1,
    reward,
    flipped: false,
  }))

  console.log(
    'Generated rewards:',
    rewardList.map((r) => r.name),
  )
})
</script>

<template>
  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 py-8 relative flex flex-col gap-8"
    :style="{ backgroundImage: `url(${PopupBackgroundImage})` }"
  >
    <h1 class="text-center text-white font-bold text-xl">Choose and get your reward</h1>

    <div class="grid grid-cols-3 gap-x-4 gap-y-6 px-4">
      <div v-for="card in cards" :key="card.id" class="flip-card" @click="toggleFlip(card)">
        <div class="flip-card-inner" :class="{ flipped: card.flipped }">
          <div class="flip-card-front">
            <img :src="MenuItemBackground" alt="Gift box" class="w-full h-full object-cover" />
          </div>

          <div class="flip-card-back">
            <div class="h-full text-center flex flex-col">
              <h2 class="text-white font-bold my-auto">{{ card.reward.name }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <button type="button">
        <img :src="BoxCoinButtonImage" alt="buy-with-coins" />
      </button>

      <button type="button">
        <img :src="BoxStarButtonImage" alt="buy-with-coins" />
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
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.flip-card-front {
  background-color: transparent;
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
