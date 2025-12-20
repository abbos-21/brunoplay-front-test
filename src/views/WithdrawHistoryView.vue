<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { WalletImage } from '@/assets/images'
import { withdrawService } from '@/api/withdrawService'
import type { Withdrawal } from '@/api/types'
import { RouterLink } from 'vue-router'
import LoaderComponent from '@/components/LoaderComponent.vue'
import { CyanSnowBackgroundImage } from '@/assets/backgrounds/winter'
import { ArrowBackIcon } from '@/assets/icons/winter'

const withdrawals = ref<Withdrawal[]>([])
const loading = ref(true)
const error = ref('')

const fetchWithdrawals = async () => {
  try {
    loading.value = true
    const response = await withdrawService.getWithdrawalHistory()
    withdrawals.value = Array.isArray(response.data?.withdrawals) ? response.data.withdrawals : []
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch withdrawal history'
  } finally {
    loading.value = false
  }
}

onMounted(fetchWithdrawals)

const formatDate = (dateStr: string | Date) => {
  const date = new Date(dateStr)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

const formatTon = (value: number | string | undefined) => {
  if (value == null || value === '') return '0'
  const num = Number(value)
  if (Number.isNaN(num)) return '0'
  const formatted = num.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  })
  return formatted
}

const statusBadgeClass = (status: Withdrawal['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-[#FFD983] text-black'
    case 'PENDING':
      return 'bg-gray-600 text-white'
    case 'FAILED':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}
</script>

<template>
  <LoaderComponent v-if="loading" />
  <div
    class="w-full h-full p-4 flex flex-col gap-4 bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url(${CyanSnowBackgroundImage})` }"
  >
    <div class="text-xl text-white font-bold text-center flex justify-between items-center">
      <RouterLink
        to="/"
        class="w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
      >
        <ArrowBackIcon class="w-6" />
      </RouterLink>
      <h1>Transaction History</h1>
      <button
        class="opacity-0 w-8 h-8 bg-[rgba(60,143,151,0.5)] rounded-full border border-white flex justify-center items-center"
      >
        <ArrowBackIcon class="w-6" />
      </button>
    </div>

    <div
      class="flex flex-col gap-4 rounded-md flex-1 overflow-y-scroll scrollbar-hide"
      style="scrollbar-width: none; -ms-overflow-style: none"
    >
      <div
        class="p-2 px-3 text-white border border-white rounded-md font-medium text-xs bg-[rgba(0,123,113,0.5)]"
      >
        <p>
          The withdrawal processing time is up to 48 hours.
          <br /><br />
          Share your payout in our chat, and celebrate your success with other players.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <p
          v-if="!loading && withdrawals.length === 0 && !error"
          class="text-white text-sm text-center font-bold"
        >
          No withdrawal history yet.
        </p>

        <div
          v-for="withdrawal in withdrawals"
          :key="withdrawal.id"
          class="bg-[rgba(0,123,113,0.5)] rounded-md border border-white p-3 flex justify-between items-center"
        >
          <div class="flex gap-3 items-center">
            <img :src="WalletImage" class="w-6" alt="" />

            <div class="text-xs text-white font-semibold flex flex-col gap-1 items-start">
              <p class="leading-tight font-normal">
                TON withdrawal to:<br /><span class="font-bold">
                  {{
                    withdrawal.targetAddress
                      ? withdrawal.targetAddress.slice(0, 4) +
                        '...' +
                        withdrawal.targetAddress.slice(-4)
                      : 'Unknown address'
                  }}
                </span>
              </p>

              <p v-if="withdrawal.txHash" class="text-[#ffd983] text-xs">
                <a
                  :href="`https://tonscan.io/tx/${withdrawal.txHash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open TX
                </a>
              </p>
              <p v-else class="text-[#ffd983] text-xs">
                {{ withdrawal.status === 'PENDING' ? 'Pending' : 'No TX available' }}
              </p>

              <p class="text-white text-xs">{{ formatDate(withdrawal.createdAt) }}</p>
            </div>
          </div>

          <div class="text-[#FFD983] text-sm flex flex-col justify-between items-end h-full">
            <p class="font-semibold leading-tight text-end">
              {{ formatTon(withdrawal.amountTon) }}<br /><span class="text-white uppercase text-xs"
                >ton</span
              >
            </p>

            <span
              class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
              :class="statusBadgeClass(withdrawal.status)"
            >
              {{ withdrawal.status }}
            </span>
          </div>
        </div>

        <!-- <div
          class="bg-[rgba(0,123,113,0.5)] rounded-md border border-white p-3 flex justify-between items-center"
        >
          <div class="flex gap-3 items-center">
            <img :src="WalletImage" class="w-6" alt="" />

            <div class="text-xs text-white font-semibold flex flex-col gap-1 items-start">
              <p class="leading-tight font-normal">
                TON withdrawal to:<br /><span class="font-bold"> Unknown address </span>
              </p>

              <p class="text-[#ffd983] text-xs">
                {{ 'No TX available' }}
              </p>

              <p class="text-white text-xs">12.12.2012</p>
            </div>
          </div>

          <div class="text-[#FFD983] text-sm flex flex-col justify-between items-end h-full">
            <p class="font-semibold leading-tight text-end">
              {{ (2).toFixed(2) }}<br /><span class="text-white uppercase text-xs">ton</span>
            </p>

            <span
              class="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
              :class="statusBadgeClass('PENDING')"
            >
              {{ 'PENDING' }}
            </span>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
