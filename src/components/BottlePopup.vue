<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { LeftArrowIcon, RightArrowIcon } from '@/assets/icons'
import { HeartImage, FlashImage, AdButtonImage, CloseImage } from '@/assets/images/winter'
import { useGame } from '@/composables/useGame'
import { useAdsgram } from '@adsgram/vue'
import { runChainUntilSuccess } from '@/utils/chainFunction'
import LoaderComponent from './LoaderComponent.vue'
import { PopupBackgroundImage } from '@/assets/backgrounds/winter'

// const blockId = import.meta.env.VITE_BLOCK_ID
const healthRewardBlockId = import.meta.env.VITE_HEALTH_REWARD_BLOCK_ID
const energyRewardBlockId = import.meta.env.VITE_ENERGY_REWARD_BLOCK_ID
const { mine, sync, getUserData } = useGame() // recoverEnergyFree, recoverHealthFree, recoverEnergy, recoverHealth,

interface Props {
  isOpen: boolean
}
interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentSection = ref(0)
const isLoading = ref(false)
const loading = ref(false)

const sections = ref([
  {
    id: 1,
    title: 'Refill health',
    content: 'Fill health tank completely to continue coin mining.',
    image: HeartImage,
    action: 'health',
  },
  {
    id: 2,
    title: 'Refill energy',
    content: 'Fill energy tank completely to continue coin mining.',
    image: FlashImage,
    action: 'energy',
  },
])

const currentSectionData = computed(() => {
  return (
    sections.value[currentSection.value] || { id: 0, title: '', content: '', image: '', action: '' }
  )
})

const nextSection = () => {
  currentSection.value = (currentSection.value + 1) % sections.value.length
}
const prevSection = () => {
  currentSection.value = (currentSection.value - 1 + sections.value.length) % sections.value.length
}
const closePopup = () => emit('close')

// const performRecovery = () => {
//   const action = currentSectionData.value.action
//   if (action === 'health') recoverHealth()
//   else if (action === 'energy') recoverEnergy()
//   closePopup()
// }

// const performFreeRecovery = () => {
//   const action = currentSectionData.value.action
//   if (action === 'health') recoverHealthFree()
//   else if (action === 'energy') recoverEnergyFree()
//   closePopup()
// }

// const buyWithCoins = () => {
//   console.log('Buying with 25 coins for:', currentSectionData.value.title)
//   performRecovery()
// }

// const watchAd = async () => {
//   try {
//     isLoading.value = true
//     const result = await show()
//     console.log('Ad result:', result)

//     if (result.done && !result.error) {
//       performFreeRecovery()
//     }
//   } catch (err) {
//     console.error('Error showing ad:', err)
//   } finally {
//     isLoading.value = false
//   }
// }

const watchAd = async () => {
  const action = currentSectionData.value.action

  if (action === 'health') {
    const { show, addEventListener } = useAdsgram({
      blockId: healthRewardBlockId,
    })

    addEventListener('onBannerNotFound', () => {
      console.log('No ad available at the moment')
    })
    addEventListener('onTooLongSession', () => {
      console.log('User session too long — ad not available')
    })

    try {
      const result = await show()

      if (result.done && !result.error) {
        loading.value = true
        setTimeout(() => {
          runChainUntilSuccess([sync, mine, getUserData])
            .then(() => {
              loading.value = false
            })
            .catch((error) => {
              console.error('Chain failed:', error)
              loading.value = false
            })
        }, 1000)
      }
    } catch (err) {
      console.log('Error showing ad: ', err)
    }
  } else if (action === 'energy') {
    const { show, addEventListener } = useAdsgram({
      blockId: energyRewardBlockId,
    })

    addEventListener('onBannerNotFound', () => {
      console.log('No ad available at the moment')
    })
    addEventListener('onTooLongSession', () => {
      console.log('User session too long — ad not available')
    })

    try {
      const result = await show()

      if (result.done && !result.error) {
        loading.value = true
        setTimeout(() => {
          runChainUntilSuccess([sync, mine, getUserData])
            .then(() => {
              loading.value = false
            })
            .catch((error) => {
              console.error('Chain failed:', error)
              loading.value = false
            })
        }, 1000)
      }
    } catch (err) {
      console.log('Error showing ad: ', err)
    }
  }

  closePopup()
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) currentSection.value = 0
  },
)

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      prevSection()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextSection()
      break
    case 'Escape':
      event.preventDefault()
      closePopup()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <LoaderComponent v-if="loading" />
  <Transition name="overlay">
    <div
      v-if="isOpen"
      class="fixed inset-0 blur-overlay flex items-center justify-center z-50"
      @click="closePopup"
    >
      <div
        class="border-2 border-white rounded-xl p-6 max-w-sm w-full mx-4 relative shadow-2xl popup-container bg-cover bg-center bg-no-repeat text-white"
        :style="{ backgroundImage: `url(${PopupBackgroundImage})` }"
        @click.stop
      >
        <button @click="closePopup" class="absolute -top-4 -right-4 w-15">
          <img :src="CloseImage" alt="close" />
        </button>

        <div class="mt-4">
          <div class="flex justify-center mb-4">
            <div
              class="w-30 h-30 border-2 border-white rounded-full flex items-center justify-center"
            >
              <img :src="currentSectionData.image" :alt="currentSectionData.title" class="w-20" />
            </div>
          </div>

          <h3 class="text-xl font-bold text-center mb-3">
            {{ currentSectionData.title }}
          </h3>

          <div class="border-2 border-white rounded-xl p-4 mb-4">
            <p class="text-center leading-relaxed font-medium">
              {{ currentSectionData.content }}
            </p>
          </div>

          <div class="flex mb-4 justify-center items-center">
            <!-- <button
              @click="buyWithCoins"
              class="flex-1 bg-[#D68C62] border-2 border-black rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-[#C47A4F] transition-colors shadow-lg"
            >
              <CoinIcon class="w-6 h-6" />
              <span class="font-bold text-black">25</span>
            </button> -->

            <button @click="watchAd" :disabled="isLoading" class="w-40">
              <img :src="AdButtonImage" alt="ad-free" />
            </button>
          </div>

          <div class="flex justify-between items-center">
            <button
              @click="prevSection"
              class="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center"
            >
              <LeftArrowIcon class="w-6 h-6" />
            </button>

            <div class="flex space-x-2">
              <div
                v-for="(section, index) in sections"
                :key="section.id"
                class="w-4 h-4 rounded-full border-2 border-white transition-colors"
                :class="index === currentSection ? 'bg-white' : 'bg-transparent'"
              ></div>
            </div>

            <button
              @click="nextSection"
              class="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center"
            >
              <RightArrowIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="text-center mt-3">
            <span class="border-2 border-white rounded-full px-3 py-1 text-sm font-bold">
              {{ currentSection + 1 }} of {{ sections.length }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.blur-overlay {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.popup-container {
  animation: popupSlideIn 0.3s ease-out;
}

@keyframes popupSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>
