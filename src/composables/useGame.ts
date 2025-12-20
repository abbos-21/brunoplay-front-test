import { ref, computed, onUnmounted } from 'vue'
import { gameService } from '@/api/gameService'
import type { ApiError, User } from '@/api/types'
import { userService } from '@/api/userService'

const user = ref<User | null>(null)
let miningInterval: ReturnType<typeof setInterval> | null = null
const error = ref<ApiError | null>(null)

const startMiningSimulation = () => {
  stopMiningSimulation()
  if (!user.value) return

  miningInterval = setInterval(() => {
    if (!user.value) return

    user.value.tempCoins += user.value.miningRate

    if (user.value.tempCoins >= user.value.vaultCapacity) {
      user.value.tempCoins = user.value.vaultCapacity
      stopMiningSimulation()
    }
  }, 1000)
}

const stopMiningSimulation = () => {
  if (miningInterval) clearInterval(miningInterval)
  miningInterval = null
}

export function useGame() {
  const mine = async () => {
    const res = await gameService.mine()
    if (res?.data?.user) {
      user.value = res.data.user
      startMiningSimulation()
    }
    return
  }

  const collect = async () => {
    const res = await gameService.collect()
    user.value = res.data.user
    if (user.value.isMining) startMiningSimulation()
  }

  const sync = async () => {
    const res = await gameService.sync()
    user.value = res.data.user
    if (user.value.isMining) startMiningSimulation()
  }

  const getUserData = async () => {
    const res = await userService.getCurrentUser()
    user.value = res.data.user
  }

  const recoverEnergy = async () => {
    try {
      const res = await gameService.recoverEnergy()
      user.value = res.data.user
      await mine()
    } catch (err) {
      error.value = err as ApiError
    } finally {
      if (user.value?.isMining) startMiningSimulation()
    }
  }

  const recoverHealth = async () => {
    try {
      const res = await gameService.recoverHealth()
      user.value = res.data.user
      await mine()
    } catch (err) {
      error.value = err as ApiError
    } finally {
      if (user.value?.isMining) startMiningSimulation()
    }
  }

  // const recoverEnergyFree = async () => {
  //   const res = await gameService.recoverEnergyByAd()
  //   user.value = res.data.user
  //   await mine()
  //   if (user.value.isMining) startMiningSimulation()
  // }

  // const recoverHealthFree = async () => {
  //   const res = await gameService.recoverHealthByAd()
  //   user.value = res.data.user
  //   await mine()
  //   if (user.value.isMining) startMiningSimulation()
  // }

  onUnmounted(stopMiningSimulation)

  return {
    user,
    mine,
    collect,
    sync,
    recoverEnergy,
    recoverHealth,
    // recoverEnergyFree,
    // recoverHealthFree,
    getUserData,
    isMining: computed(() => user.value?.isMining ?? false),
  }
}
