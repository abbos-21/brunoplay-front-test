<script setup lang="ts">
import { onMounted, ref, computed, inject } from 'vue'
import WebApp from '@twa-dev/sdk'
import { toast } from 'vue3-toastify'
import { useAdsgram } from '@adsgram/vue'

import { useGame } from '@/composables/useGame'
import { useNavigate } from '@/composables/useNavigate'
import { useOrchestrator, type OrchestratorTask } from '@/composables/useOrchestrator'
import { runChainUntilSuccess } from '@/utils/chainFunction'

import { isMusicEnabled, isMusicAvailable, toggleMusic } from '@/stores/music'

import EnergyLevel from '@/components/EnergyLevel.vue'
import HealthLevel from '@/components/HealthLevel.vue'
import BottlePopup from '@/components/BottlePopup.vue'
import SpinPopup from '@/components/SpinPopup.vue'
import ProgressBar from '@/components/ProgressBar.vue'

import {
  Level1BackgroundImage,
  Level2BackgroundImage,
  Level3BackgroundImage,
  Level4BackgroundImage,
  Level5BackgroundImage,
  Level6BackgroundImage,
  Level7BackgroundImage,
  Level8BackgroundImage,
  Level9BackgroundImage,
  Level10BackgroundImage,
  Level11BackgroundImage,
  Level12BackgroundImage,
  Level13BackgroundImage,
} from '@/assets/backgrounds/winter'
import {
  CoinImage,
  CollectButtonImage,
  PodiumImage,
  UnitedKingdomFlagImage,
  WithdrawImage,
  MusicImage,
  IceImage,
  SpinImage,
} from '@/assets/images/winter'

import { useSeasonTimer } from '@/composables/useSeasonTimer'

const { timeLeftLabel } = useSeasonTimer()

/* -------------------- USER / BIGGIE -------------------- */
const BIGGIES = new Set<number>([5035538171, 1031081189, 352641904, 1701438929])

const telegramUserId = WebApp.initDataUnsafe?.user?.id ?? null
const isBiggie = telegramUserId !== null && BIGGIES.has(telegramUserId)

const runIfUserIsNotBiggie = (fn: () => void) => {
  if (!isBiggie) fn()
}

/* -------------------- ADS -------------------- */
const interstitialAds = useAdsgram({ blockId: import.meta.env.VITE_BLOCK_ID })
const spinAds = useAdsgram({ blockId: import.meta.env.VITE_SPIN_BLOCK_ID })
const collectAds = useAdsgram({ blockId: import.meta.env.VITE_COLLECT_BLOCK_ID })
const withdrawalAds = useAdsgram({
  blockId: import.meta.env.VITE_WITHDRAWAL_BLOCK_ID,
})
const bottleAds = useAdsgram({ blockId: import.meta.env.VITE_BOTTLE_BLOCK_ID })

const tasks: OrchestratorTask[] = [
  { name: 'Interstitial', probability: 25, fn: () => interstitialAds.show() },
  { name: 'Spin', probability: 75, fn: () => spinAds.show() },
]

const { run: runSpinAds } = useOrchestrator(tasks)

/* -------------------- GAME -------------------- */
const { user, mine, collect, sync, getUserData } = useGame()
const { goTo } = useNavigate()

/* -------------------- POPUPS -------------------- */
const isBottlePopupOpen = ref(false)
const isSpinPopupOpen = ref(false)

const openBottlePopup = () => {
  isBottlePopupOpen.value = true
  runIfUserIsNotBiggie(() => bottleAds.show())
}
const closeBottlePopup = () => (isBottlePopupOpen.value = false)

const openSpinPopup = () => {
  isSpinPopupOpen.value = true
  runSpinAds()
}
const closeSpinPopup = async () => {
  isSpinPopupOpen.value = false
  await getUserData()
}

/* -------------------- COMPUTED -------------------- */
const canCollect = computed(() => {
  if (!user.value) return false
  return user.value.tempCoins >= user.value.vaultCapacity * 0.1
})

/* -------------------- ACTIONS -------------------- */
const handleWithdraw = () => {
  runIfUserIsNotBiggie(() => withdrawalAds.show())
  goTo('/withdraw')
}

const handleCollect = () => {
  collect()
  runIfUserIsNotBiggie(() => collectAds.show())
}

const navHeight = inject('navHeight')
const withdrawRate: number | undefined = inject('withdrawRate')

/* -------------------- LIFECYCLE -------------------- */
onMounted(async () => {
  if (telegramUserId === 1031081189) {
    alert('Hey, you must be the admin!')
  }

  await runChainUntilSuccess([sync, mine, getUserData])

  if (user.value?.healthLevel === 0) {
    toast.info('Health 0, coins burned')
  }
})

const levelBackgrounds = [
  Level1BackgroundImage,
  Level2BackgroundImage,
  Level3BackgroundImage,
  Level4BackgroundImage,
  Level5BackgroundImage,
  Level6BackgroundImage,
  Level7BackgroundImage,
  Level8BackgroundImage,
  Level9BackgroundImage,
  Level10BackgroundImage,
  Level11BackgroundImage,
  Level12BackgroundImage,
  Level13BackgroundImage,
]

const backgroundImage = computed(() => {
  const level = user.value?.level ?? 1

  // Clamp level to available backgrounds
  const index = Math.min(Math.max(level - 1, 0), levelBackgrounds.length - 1)

  return `url(${levelBackgrounds[index]})`
})
</script>

<template>
  <div
    class="h-full w-full flex flex-col relative bg-cover bg-center bg-no-repeat p-2 gap-4 justify-between"
    :style="{
      backgroundImage,
      paddingBottom: `${navHeight}px`,
    }"
  >
    <!-- TOP BAR -->
    <div class="flex justify-between items-start">
      <div class="flex flex-col gap-2 items-start">
        <button
          @click="handleWithdraw"
          class="flex gap-2 items-center rounded-full bg-sky-400 px-2 py-1 border-4 border-sky-200"
        >
          <img :src="CoinImage" class="w-5 h-5" />
          <div class="text-center">
            <p class="font-bold text-sm">{{ user?.coins.toFixed(2) ?? 0 }}</p>
            <p class="text-[10px] font-bold text-gray-500">
              {{ ((user?.coins ?? 0) / (withdrawRate ?? Infinity)).toFixed(2) }} TON
            </p>
          </div>
          <img :src="WithdrawImage" class="w-5 h-5" />
        </button>

        <RouterLink to="/leaderboard" class="flex flex-col items-center gap-1">
          <img :src="PodiumImage" class="w-8" />
          <span
            class="bg-[#00C5A6] text-white text-[10px] font-bold px-1 py-px rounded-md w-25 text-center"
          >
            {{ timeLeftLabel }}
          </span>
        </RouterLink>
      </div>

      <div class="flex flex-col gap-2 items-end">
        <div class="rounded-full bg-sky-400 px-2 py-1 border-4 border-sky-200">
          <p class="text-sm font-bold">Your level: {{ user?.level ?? 0 }}</p>
        </div>

        <div
          class="w-10 h-10 flex justify-center items-center rounded-full bg-sky-400 border-4 border-sky-200"
        >
          <img :src="UnitedKingdomFlagImage" class="w-5 h-5" />
        </div>

        <button
          class="w-8 h-8 relative music-button mx-1"
          :class="{ 'music-disabled': !isMusicEnabled || !isMusicAvailable }"
          @click="toggleMusic"
        >
          <img :src="MusicImage" class="w-full h-full" />
          <div
            v-if="!isMusicEnabled || !isMusicAvailable"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="diagonal-line"></div>
          </div>
        </button>
      </div>
    </div>

    <!-- STATS -->
    <div>
      <div class="flex justify-center">
        <div class="w-40">
          <ProgressBar
            :current-value="user?.tempCoins ?? 0"
            :max-value="user?.vaultCapacity ?? Infinity"
            :min-value="0"
          />
        </div>
      </div>

      <div class="flex justify-between mt-2">
        <HealthLevel
          :current-value="user?.currentHealth ?? 0"
          :max-value="user?.maxHealth ?? 0"
          color="green"
          size="medium"
          :show-glow="true"
          :animated="true"
        />
        <EnergyLevel
          :current-value="user?.currentEnergy ?? 0"
          :max-value="user?.maxEnergy ?? 0"
          color="blue"
          size="medium"
          :show-glow="true"
          :animated="true"
        />
      </div>
    </div>

    <!-- ACTIONS -->
    <div class="flex justify-between items-center">
      <button @click="openBottlePopup">
        <img :src="IceImage" class="w-9" />
      </button>

      <button @click="openSpinPopup">
        <img :src="SpinImage" class="w-9" />
      </button>
    </div>

    <div class="flex justify-center">
      <button
        class="collect-button mb-2"
        :disabled="!canCollect"
        :class="{ 'cursor-not-allowed opacity-50': !canCollect }"
        @click="handleCollect"
      >
        <img :src="CollectButtonImage" class="w-full" />
      </button>
    </div>
  </div>

  <BottlePopup :is-open="isBottlePopupOpen" @close="closeBottlePopup" />
  <SpinPopup :is-open="isSpinPopupOpen" @close="closeSpinPopup" />
</template>

<style scoped>
.music-button {
  transition: opacity 0.2s ease;
}
.music-disabled {
  opacity: 0.7;
}
.diagonal-line {
  width: 45px;
  height: 1.5px;
  background-color: red;
  transform: rotate(45deg);
}
.collect-button {
  width: 160px;
}
@media (max-width: 375px) {
  .collect-button {
    width: 144px;
  }
}
@media (max-width: 320px) {
  .collect-button {
    width: 128px;
  }
}
</style>
