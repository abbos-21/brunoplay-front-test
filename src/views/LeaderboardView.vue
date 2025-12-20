<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, inject } from 'vue'
import { RouterLink } from 'vue-router'

import { leaderboardService } from '@/api/leaderboardService'
import type { Season, LeaderboardResponse } from '@/api/types'

import { LeaderboardBackgroundImage } from '@/assets/backgrounds/winter'
import { ArrowBackIcon, CupIcon, InfoIcon, SwitchIcon } from '@/assets/icons/winter'
import { CoinImage, UserImage } from '@/assets/images/winter'
import LoaderComponent from '@/components/LoaderComponent.vue'

/* -------------------- state -------------------- */
const season = ref<Season | null>(null)
const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
})

const users = ref<LeaderboardResponse['users']>([])
const loading = ref(true)
const currentLevel = ref(1)
let timerInterval: ReturnType<typeof setInterval> | null = null

/* -------------------- computed -------------------- */
const timeLeftLabel = computed(() => {
  if (timeLeft.value.expired) return 'Season ended'
  const { days, hours, minutes, seconds } = timeLeft.value
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
})

/* -------------------- methods -------------------- */
const fetchSeason = async () => {
  const res = await leaderboardService.getSeason()
  season.value = res.data.season
  startTimer(res.data.season.end) // start countdown
}

const fetchUsers = async () => {
  const res = await leaderboardService.getUsers(currentLevel.value)
  users.value = res.data.users
}

const prevLevel = async () => {
  if (currentLevel.value <= 1) return
  currentLevel.value--
  loading.value = true
  await fetchUsers()
  loading.value = false
}

const nextLevel = async () => {
  if (currentLevel.value >= 13) return
  currentLevel.value++
  loading.value = true
  await fetchUsers()
  loading.value = false
}

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

/* -------------------- lifecycle -------------------- */
onMounted(async () => {
  loading.value = true
  await Promise.all([fetchSeason(), fetchUsers()])
  loading.value = false
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const withdrawRate: number | undefined = inject('withdrawRate')

const getRankCoins = (index: number) => {
  if (index < 10) {
    return 50000 - index * 1000
  }
  return 25000
}
</script>

<template>
  <LoaderComponent v-if="loading" />
  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 relative flex flex-col justify-between text-white"
    :style="{ backgroundImage: `url(${LeaderboardBackgroundImage})` }"
  >
    <!-- HEADER -->
    <div class="flex flex-col gap-2 items-center">
      <div class="flex justify-between items-center p-4 w-full">
        <RouterLink
          to="/"
          class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
        >
          <ArrowBackIcon class="w-6" />
        </RouterLink>

        <div class="flex justify-center gap-4 items-center">
          <button
            class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
          >
            <SwitchIcon class="w-4 opacity-60" />
          </button>

          <h1 class="uppercase font-bold text-xl">
            {{ season?.name ?? 'season' }}
          </h1>

          <button
            class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
          >
            <SwitchIcon class="w-4 rotate-180 opacity-60" />
          </button>
        </div>

        <button
          class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
        >
          <InfoIcon class="w-6" />
        </button>
      </div>

      <div
        class="border border-[#b6d4d7] bg-[rgba(60,143,151,0.5)] px-4 py-2 rounded-full font-bold"
      >
        {{ timeLeftLabel }}
      </div>
    </div>

    <div class="flex flex-col gap-2 flex-1 px-4 my-4 scrollbar-hide overflow-y-scroll">
      <div
        v-for="(user, index) in users"
        :key="user.id"
        class="flex justify-between items-center border border-[#b6d4d7] bg-[rgba(60,143,151,0.5)] p-2 rounded-xl"
      >
        <div class="flex items-center gap-2">
          <img :src="UserImage" class="w-12" />

          <!-- <div class="flex flex-col gap-1 font-bold leading-none">
            <h2 class="text-sm">{{ user.firstName ?? user.lastName ?? 'No name user' }}</h2>
            <p class="text-xs opacity-60" v-if="user.username">@{{ user.username }}</p>
            <p class="text-xs opacity-60" v-else>No username</p>

            <div class="text-xs flex gap-1 items-center">
              <img :src="CoinImage" class="w-4" />
              <span>{{ user.totalCoins.toLocaleString() }}</span>
            </div>
          </div> -->

          <div class="flex flex-col gap-1 font-bold leading-none">
            <h2 class="text-sm truncate max-w-36">
              {{ user.firstName ?? user.lastName ?? 'No name user' }}
            </h2>
            <p class="text-xs opacity-60" v-if="user.username">@{{ user.username }}</p>
            <p class="text-xs opacity-60" v-else>No username</p>

            <div class="text-xs flex gap-1 items-center">
              <img :src="CoinImage" class="w-4" />
              <span>{{ Math.round(user.totalCoins).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- RANK -->
        <div class="flex flex-col items-center gap-1 font-bold leading-none">
          <CupIcon v-if="index === 0" class="w-6 text-orange-400" />
          <CupIcon v-else-if="index === 1" class="w-6 text-slate-400" />
          <CupIcon v-else-if="index === 2" class="w-6 text-[#C67747]" />
          <h1 v-else>#{{ index + 1 }}</h1>

          <p class="text-xs">{{ getRankCoins(index).toLocaleString() }} coins</p>

          <p class="text-[10px] opacity-60">
            = {{ (getRankCoins(index) / (withdrawRate ?? Infinity)).toFixed(2) }} TON
          </p>
        </div>
      </div>
    </div>

    <!-- LEVEL SWITCH -->
    <div class="flex justify-center gap-4 items-center p-4">
      <button
        @click="prevLevel"
        class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
      >
        <SwitchIcon class="w-4" />
      </button>

      <div class="border border-white rounded-full bg-[rgba(60,143,151,0.5)] px-4 py-1">
        <h1 class="uppercase font-bold text-lg">level {{ currentLevel }}</h1>
      </div>

      <button
        @click="nextLevel"
        class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
      >
        <SwitchIcon class="w-4 rotate-180" />
      </button>
    </div>
  </div>
</template>
