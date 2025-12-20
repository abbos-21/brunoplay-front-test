<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue3-toastify'

import { HistoryIcon } from '@/assets/icons/winter'
import { CloseImage, CoinImage } from '@/assets/images/winter'

import { withdrawService } from '@/api/withdrawService'
import type { ApiError } from '@/api/types'
import { useGame } from '@/composables/useGame'
import LoaderComponent from '@/components/LoaderComponent.vue'
import { CyanSnowBackgroundImage } from '@/assets/backgrounds/winter'

/* -------------------- layout -------------------- */

/* -------------------- state -------------------- */
const WITHDRAW_FEE = 0.005
const amountCoins = ref<number | null>(null)
const targetAddress = ref<string>('')

const withdrawRate = ref<number | null>(null)
const minWithdraw = ref<number | null>(null)
const maxWithdraw = ref<number | null>(null)

const loading = ref<boolean>(true)
const error = ref<ApiError | null>(null)

/* -------------------- game -------------------- */
const { user, getUserData } = useGame()

/* -------------------- computed -------------------- */
const tonAmount = computed(() => {
  if (!withdrawRate.value || !amountCoins.value) return 0

  const grossTon = amountCoins.value / withdrawRate.value
  const netTon = grossTon - WITHDRAW_FEE

  return netTon > 0 ? netTon : 0
})

/* -------------------- api -------------------- */
const getWithdrawData = async () => {
  try {
    const res = await withdrawService.getWithdrawalData()
    withdrawRate.value = res.data.rate
    minWithdraw.value = res.data.min
    maxWithdraw.value = res.data.max
  } catch (err) {
    error.value = err as ApiError
    toast.error(error.value.response?.data?.message || 'Failed to load withdrawal data')
  }
}

const withdraw = async () => {
  if (
    minWithdraw.value !== null &&
    maxWithdraw.value !== null &&
    ((amountCoins.value as number) < minWithdraw.value ||
      (amountCoins.value as number) > maxWithdraw.value)
  ) {
    toast.error(`Amount must be between ${minWithdraw.value} and ${maxWithdraw.value}`)
    return
  }

  try {
    loading.value = true
    const res = await withdrawService.withdrawCoins(amountCoins.value, targetAddress.value)

    if (res?.success) {
      toast.success(res.message)
      await getUserData()
      amountCoins.value = 0
      targetAddress.value = ''
    }
  } catch (err) {
    error.value = err as ApiError
    toast.error(error.value.response?.data?.message || 'Withdrawal failed')
  } finally {
    loading.value = false
  }
}

const fetchData = async () => {
  await Promise.all([getUserData(), getWithdrawData()])
}

/* -------------------- lifecycle -------------------- */
onMounted(async () => {
  try {
    await fetchData()
  } catch (err) {
    console.error('Withdraw page error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <LoaderComponent v-if="loading" />

  <form
    @submit.prevent="withdraw"
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 pb-4 relative flex flex-col gap-4 text-white scrollbar-hide overflow-y-scroll"
    :style="{ backgroundImage: `url(${CyanSnowBackgroundImage})` }"
  >
    <!-- HEADER -->
    <div class="flex justify-between items-center py-4">
      <h1 class="text-2xl font-bold">Withdrawal</h1>

      <RouterLink to="/">
        <img :src="CloseImage" class="w-20" alt="close" />
      </RouterLink>
    </div>

    <!-- BALANCE -->
    <div
      class="border border-white bg-[rgba(0,123,113,0.5)] py-4 px-8 rounded-xl flex justify-between items-center"
    >
      <img :src="CoinImage" class="w-20" alt="coin" />

      <div class="text-xl font-bold text-center">
        <h1>Your coin balance:</h1>
        <p class="text-2xl tracking-wider">
          {{ user?.coins.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- RATE -->
    <h1 class="text-center font-bold">Coin rate: {{ withdrawRate }} coins = 1 TON</h1>

    <!-- FORM -->
    <div class="border border-white bg-[rgba(0,123,113,0.5)] p-4 rounded-xl flex flex-col gap-4">
      <div class="w-full flex justify-between items-center text-sm font-semibold">
        <label for="coins">Enter the amount of coins:</label>
        <input
          id="coins"
          type="number"
          required
          v-model.number="amountCoins"
          class="border-b border-white max-w-1/3 bg-transparent outline-none"
          placeholder="0.00"
        />
      </div>

      <div class="w-full flex justify-between items-center text-sm font-semibold">
        <label for="address">Enter the TON address:</label>
        <input
          id="address"
          type="text"
          required
          v-model="targetAddress"
          class="border-b border-white max-w-1/3 bg-transparent outline-none"
          placeholder="UQA..."
        />
      </div>

      <!-- <p class="text-xs text-center">Min: {{ minWithdraw }} coins • Max: {{ maxWithdraw }} coins</p> -->
    </div>

    <!-- FOOTER -->
    <div class="flex flex-col items-center text-xs font-semibold gap-2 py-4 flex-1 justify-end">
      <div class="flex justify-center gap-4">
        <p>Blockchain fee: 0.005 TON</p>
        <p>You will receive: {{ tonAmount.toFixed(4) }} TON</p>
      </div>

      <button type="submit" class="text-xl text-black bg-white rounded-xl px-25 py-2 font-bold">
        Withdraw
      </button>

      <RouterLink to="/withdraw-history" class="flex items-center gap-1">
        <HistoryIcon class="w-5" />
        <span>Transaction History</span>
      </RouterLink>
    </div>
  </form>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
