<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'

import { useGame } from '@/composables/useGame'
import { upgradeService } from '@/api/upgradeService'
import type { ApiError, UpgradeStatusItem } from '@/api/types'

import LoaderComponent from '@/components/LoaderComponent.vue'

import {
  CoinImage,
  WithdrawImage,
  WealthImage,
  WorkImage,
  FoodImage,
  ImmuneImage,
} from '@/assets/images/winter'
import { TealSnowBackgroundImage } from '@/assets/backgrounds/winter'

/* -------------------- state -------------------- */
const error = ref<ApiError | null>(null)
const loading = ref(false)
const pageLoading = ref(true)
const upgradingName = ref<UpgradeStatusItem['name'] | null>(null)

const upgradeStatus = ref<UpgradeStatusItem[]>([])

/* -------------------- game -------------------- */
const { getUserData, user } = useGame()

/* -------------------- icons mapping -------------------- */
const icons: Record<UpgradeStatusItem['name'], string> = {
  wealth: WealthImage,
  work: WorkImage,
  food: FoodImage,
  immune: ImmuneImage,
}

/* -------------------- api -------------------- */
const getUpgradeStatus = async () => {
  const res = await upgradeService.status()
  upgradeStatus.value = res.data.status
}

const handleUpgrade = async (name: UpgradeStatusItem['name']) => {
  try {
    loading.value = true
    upgradingName.value = name

    await upgradeService.upgrade(name)
    await Promise.all([getUserData(), getUpgradeStatus()])
  } catch (err) {
    error.value = err as ApiError
    toast.error(error.value.response?.data?.message || 'Upgrade failed')
  } finally {
    loading.value = false
    upgradingName.value = null
  }
}

/* -------------------- lifecycle -------------------- */
onMounted(async () => {
  try {
    await Promise.all([getUserData(), getUpgradeStatus()])
  } catch (err) {
    console.error('Initial shop loading failed:', err)
  } finally {
    pageLoading.value = false
  }
})

const navHeight = inject('navHeight')
const withdrawRate: number | undefined = inject('withdrawRate')
</script>

<template>
  <LoaderComponent v-if="pageLoading" />

  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 relative flex flex-col"
    :style="{ backgroundImage: `url(${TealSnowBackgroundImage})`, paddingBottom: `${navHeight}px` }"
  >
    <!-- HEADER -->
    <div class="flex justify-between items-start">
      <RouterLink
        to="/withdrawal"
        class="flex gap-2 items-center rounded-full bg-sky-400 px-2 py-1 border-4 border-sky-200"
      >
        <img :src="CoinImage" class="w-5 h-5" />
        <div class="text-center">
          <p class="font-bold text-sm">
            {{ user?.coins.toFixed(2) ?? 0 }}
          </p>
          <p class="text-[10px] font-bold text-gray-500">
            {{ ((user?.coins ?? 0) / (withdrawRate ?? Infinity)).toFixed(2) }} TON
          </p>
        </div>
        <img :src="WithdrawImage" class="w-5 h-5" />
      </RouterLink>

      <div class="text-center rounded-full bg-sky-400 px-2 py-1 border-4 border-sky-200">
        <p class="text-sm font-bold">Your level: {{ user?.level ?? 1 }}</p>
      </div>
    </div>

    <!-- UPGRADES -->
    <div class="my-4 flex flex-col gap-4 overflow-y-scroll scrollbar-hide">
      <div
        v-for="upgrade in upgradeStatus"
        :key="upgrade.name"
        class="rounded-xl bg-[rgba(161,213,209,0.5)] p-4 flex flex-col gap-2 items-center"
      >
        <div class="flex gap-2 items-start w-full">
          <div class="w-12 shrink-0">
            <img :src="icons[upgrade.name]" class="w-full" />
          </div>

          <div class="flex flex-col gap-1 items-start flex-1">
            <div class="flex justify-between items-center w-full">
              <h1 class="uppercase text-white font-bold">
                {{ upgrade.name }}
              </h1>

              <div class="bg-white font-bold text-sm rounded-md px-1 py-px">
                Lvl.
                <span class="text-green-500">{{ upgrade.level }}</span>
                /
                <span class="text-orange-500">{{ upgrade.maxLevel }}</span>
              </div>
            </div>

            <div class="bg-white font-medium text-[10px] rounded-md px-1 py-px">
              {{ upgrade.effect }}
            </div>

            <p class="text-white font-medium text-xs">
              {{ upgrade.details }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex gap-1 items-center rounded-full bg-[#FFAC33] px-4 py-1 font-bold disabled:opacity-50"
          :disabled="loading || !upgrade.canUpgrade"
          @click="handleUpgrade(upgrade.name)"
        >
          <template v-if="loading && upgradingName === upgrade.name"> upgrading... </template>

          <template v-else-if="!upgrade.canUpgrade"> max level </template>

          <template v-else>
            <img :src="CoinImage" class="w-6" />
            <span>{{ upgrade.cost }}</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
