<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { CoinImage } from '@/assets/images/winter'
import LoaderComponent from '@/components/LoaderComponent.vue'

import { userService } from '@/api/userService'
import type { User } from '@/api/types'
import { TealSnowBackgroundImage } from '@/assets/backgrounds/winter'
import { toast } from 'vue3-toastify'

/* -------------------- state -------------------- */
type ReferralRewardsArray = [string, number][]

const referralLink = ref<string>('')
const referrals = ref<User[]>([])
const totalReferralsCount = ref<number>(0)
const referralCounts = ref<Record<number, number>>({})
const referralEarnings = ref<number>(0)
const referralRewards = ref<ReferralRewardsArray>([])
const loading = ref<boolean>(false)
// const copied = ref<boolean>(false)

/* -------------------- actions -------------------- */
const copyLink = async (e: Event) => {
  e.preventDefault()
  await navigator.clipboard.writeText(referralLink.value)
  toast.success('Copied!', {
    autoClose: 500,
  })
  // copied.value = true
  // setTimeout(() => (copied.value = false), 1500)
}

/* -------------------- api -------------------- */
const getReferralLink = async () => {
  const res = await userService.getReferralLink()
  referralLink.value = res.data.link
}

const getReferrals = async () => {
  const res = await userService.getAllReferrals()

  referrals.value = res.data.referrals as User[]
  totalReferralsCount.value = res.data.count
  referralEarnings.value = res.data.referralEarnings
  referralRewards.value = Object.entries(res.data.referralRewards)

  referralCounts.value = referrals.value.reduce(
    (acc, user) => {
      acc[user.level] = (acc[user.level] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )
}

const loadReferralData = async () => {
  try {
    loading.value = true
    await Promise.all([getReferralLink(), getReferrals()])
  } catch (err) {
    console.error('Failed to load referral data:', err)
  } finally {
    loading.value = false
  }
}

/* -------------------- lifecycle -------------------- */
onMounted(loadReferralData)
const navHeight = inject('navHeight')
</script>

<template>
  <LoaderComponent v-if="loading" />

  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 relative flex flex-col mb-4"
    :style="{ backgroundImage: `url(${TealSnowBackgroundImage})`, paddingBottom: `${navHeight}px` }"
  >
    <div class="flex flex-col gap-4 text-white overflow-y-scroll scrollbar-hide">
      <h1 class="uppercase text-center text-lg font-bold">invite and earn!</h1>

      <!-- REFERRAL LINK -->
      <div class="flex flex-col gap-1 items-start font-semibold">
        <h2 class="text-xs">Your referral link:</h2>

        <form class="w-full flex gap-2" @submit.prevent="copyLink">
          <input
            type="text"
            disabled
            :value="referralLink"
            class="bg-transparent border border-white px-2 py-1 flex-1 text-xs rounded-md"
          />

          <button
            type="submit"
            class="bg-transparent text-sm px-4 py-2 border border-white rounded-md"
          >
            <span>Copy</span>
          </button>
        </form>
      </div>

      <!-- STATS -->
      <div class="border border-white rounded-md flex flex-col gap-2 p-2">
        <h1 class="text-center font-bold text-sm">
          Earnings from referrals: {{ referralEarnings }} coins
        </h1>

        <div class="h-px w-full bg-white"></div>

        <div class="flex items-start justify-between gap-2 font-semibold text-xs">
          <div class="flex flex-col gap-1">
            <h2 class="text-sm">Your referrals’ upgrades</h2>

            <p
              v-for="level in Object.keys(referralCounts)
                .map(Number)
                .sort((a, b) => a - b)"
              :key="level"
              class="ps-1"
            >
              Level {{ level }} referrals: {{ referralCounts[level] }}
            </p>
          </div>

          <div>
            <h2 class="text-sm">Total referrals: {{ totalReferralsCount }}</h2>
          </div>
        </div>
      </div>

      <!-- REWARDS -->
      <div class="border border-white rounded-md flex flex-col gap-2 p-2">
        <h1 class="text-sm font-bold">Referral-level rewards</h1>

        <div
          v-for="[level, reward] in referralRewards"
          :key="level"
          class="flex justify-between items-center text-xs font-semibold px-1"
        >
          <h2>Level {{ level }}</h2>

          <div class="flex gap-1 items-center">
            <p>{{ reward }}</p>
            <img :src="CoinImage" class="w-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
