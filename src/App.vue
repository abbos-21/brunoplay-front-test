<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, provide } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import WebApp from '@twa-dev/sdk'
import { toast } from 'vue3-toastify'

import { authService } from './api/authService'
import LoaderComponent from './components/LoaderComponent.vue'
import { BgMusicAudio } from '@/assets/audios'
import {
  setAudioElement,
  isMusicEnabled,
  isMusicAvailable,
  setMusicPlaying,
  setMusicAvailable,
} from '@/stores/music'

import {
  MenuItemFriendsImage,
  MenuItemHomeImage,
  MenuItemShopImage,
  MenuItemTasksImage,
} from './assets/images/winter'
import { withdrawService } from './api/withdrawService'
import { blockListService } from './api/blockListService'

const route = useRoute()

/* -------------------- STATE -------------------- */
const loading = ref(true)
const authFailed = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)
const navIsVisible = ref(true)

/* -------------------- USER / BIGGIE -------------------- */
const BIGGIES = new Set<number>([5035538171, 1031081189, 352641904, 1701438929])

const telegramUserId = computed<number | null>(() => WebApp.initDataUnsafe?.user?.id ?? null)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isUserBiggie = computed(
  () => telegramUserId.value !== null && BIGGIES.has(telegramUserId.value),
)

/* -------------------- AUDIO -------------------- */
watch(audioRef, (el) => {
  if (el) setAudioElement(el)
})

const resumeOnInteraction = () => {
  if (!audioRef.value || !isMusicEnabled.value || isMusicAvailable.value) return

  audioRef.value
    .play()
    .then(() => {
      setMusicAvailable(true)
      setMusicPlaying(true)
      removeInteractionListeners()
    })
    .catch(() => {
      /* ignored – browser blocked autoplay */
    })
}

const addInteractionListeners = () => {
  document.addEventListener('click', resumeOnInteraction)
  document.addEventListener('touchstart', resumeOnInteraction)
}

const removeInteractionListeners = () => {
  document.removeEventListener('click', resumeOnInteraction)
  document.removeEventListener('touchstart', resumeOnInteraction)
}

const handleAudioLoaded = async () => {
  if (!audioRef.value || !isMusicEnabled.value) return

  try {
    audioRef.value.muted = false
    await audioRef.value.play()
    setMusicAvailable(true)
    setMusicPlaying(true)
  } catch {
    setMusicAvailable(false)
    setMusicPlaying(false)
    addInteractionListeners()
  }
}

const handleAudioEnded = () => {
  setMusicPlaying(false)
}

const handleAudioError = () => {
  setMusicAvailable(false)
  setMusicPlaying(false)
}

/* -------------------- AUTH -------------------- */
const authenticate = async () => {
  // 🚫 HARD GUARD
  if (!isTelegramMobile()) {
    authFailed.value = true
    loading.value = false
    toast.error('This game works only in Telegram Mobile')
    return
  }

  loading.value = true
  authFailed.value = false

  try {
    await authService.loginWithTelegram()
  } catch (err: unknown) {
    console.error('Auth error:', err)
    authFailed.value = true
    toast.error('Connection failed. Tap to retry.')
  } finally {
    loading.value = false
  }
}

const handleRetry = () => {
  bootstrapApp()
}

const isTelegramMobile = (): boolean => {
  const platform = WebApp.platform
  return platform === 'android' || platform === 'ios' || platform === 'android_x'
}

const withdrawRate = ref<number | null>(null)
provide('withdrawRate', withdrawRate)

onMounted(() => {
  WebApp.ready()
  WebApp.expand()
  bootstrapApp()
})

onBeforeUnmount(() => {
  removeInteractionListeners()
})

watch(
  () => route.name,
  (name) => {
    navIsVisible.value = !(
      name === 'leaderboard' ||
      name === 'withdraw' ||
      name === 'withdraw-history'
    )
  },
  { immediate: true },
)

const navElement = ref<HTMLElement | null>(null)
const navHeight = ref(0)

provide('navHeight', navHeight)

let observer: ResizeObserver | null = null

watch(
  navElement,
  (el) => {
    observer?.disconnect()
    observer = null

    if (!el) {
      navHeight.value = 0
      return
    }

    observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      navHeight.value = entry.contentRect.height
    })

    observer.observe(el)
  },
  { flush: 'post' },
)

const bootstrapApp = async () => {
  loading.value = true
  authFailed.value = false

  try {
    /* 1️⃣ Load block list */
    const blockListResponse = await blockListService.getBlockList()
    const blockedUsers = new Set(blockListResponse.data.users.map((u) => u.telegramId))

    const telegramId = WebApp.initDataUnsafe?.user?.id?.toString()

    if (!telegramId) {
      throw new Error('Telegram user not found')
    }

    /* 2️⃣ Block enforcement */
    if (blockedUsers.has(telegramId)) {
      toast.error(
        'Your access to our Telegram bot has been blocked for violating the terms of service.',
      )
      authFailed.value = true
      return
    }

    /* 3️⃣ Authenticate */
    await authenticate()

    /* 4️⃣ Load withdrawal data */
    const withdrawDataResponse = await withdrawService.getWithdrawalData()
    withdrawRate.value = withdrawDataResponse.data.rate
  } catch (err) {
    console.error(err)
    authFailed.value = true
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <!-- APP -->

  <LoaderComponent v-if="loading" />

  <div
    v-else-if="authFailed"
    class="fixed inset-0 flex items-center justify-center z-50 px-4 bg-sky-400"
  >
    <div
      class="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl max-w-sm w-full border border-white"
    >
      <h3 class="text-xl font-bold text-white mb-4">Connection Lost</h3>
      <p class="text-sm text-white mb-8">Tap below to reconnect to the game</p>

      <button
        @click="handleRetry"
        class="w-full px-6 py-4 text-white font-bold rounded-md border border-white"
      >
        🔄 Tap to Reconnect
      </button>

      <p class="text-xs text-white mt-6">Works only in Telegram Mobile</p>
    </div>
  </div>

  <div class="app-container" v-else>
    <audio
      ref="audioRef"
      loop
      preload="auto"
      :muted="!isMusicEnabled || !isMusicAvailable"
      @loadeddata="handleAudioLoaded"
      @ended="handleAudioEnded"
      @error="handleAudioError"
    >
      <source :src="BgMusicAudio" type="audio/mpeg" />
    </audio>

    <div class="h-screen w-screen flex justify-center items-center">
      <div class="max-w-md w-full h-full relative">
        <RouterView />

        <nav
          class="grid grid-cols-4 px-2 absolute bottom-2 inset-x-0"
          ref="navElement"
          v-if="navIsVisible"
        >
          <RouterLink to="/">
            <img :src="MenuItemHomeImage" alt="home" />
          </RouterLink>
          <RouterLink to="/shop">
            <img :src="MenuItemShopImage" alt="shop" />
          </RouterLink>
          <RouterLink to="/tasks">
            <img :src="MenuItemTasksImage" alt="tasks" />
          </RouterLink>
          <RouterLink to="/friends">
            <img :src="MenuItemFriendsImage" alt="friends" />
          </RouterLink>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
