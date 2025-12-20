<script setup lang="ts">
import { ref, computed, type CSSProperties, onMounted, nextTick } from 'vue'
import { SpinPointerIcon } from '@/assets/icons/winter'
import { SpinButtonImage } from '@/assets/images/winter'
import { useSpinWheel } from '@/composables/useSpinWheel'
import LoaderComponent from './LoaderComponent.vue'

interface Segment {
  label: string
  value: number
  color: string
}

const { canSpin, spin, fetchStatus, cooldownRemaining } = useSpinWheel()

const isLoading = ref(false)

const SIZE = 250
const SPINS = 5
const SPIN_DURATION = 4000
const RESET_DURATION = 800
const POINTER_ANGLE = 270

const segments = ref<Segment[]>([
  { label: '+5', value: 5, color: '#FFE07D' },
  { label: '10', value: 10, color: '#b3e59f' },
  { label: '15', value: 15, color: '#7ca1bc' },
  { label: '20', value: 20, color: '#FFC251' },
  { label: '25', value: 25, color: '#E28086' },
  { label: '30', value: 30, color: '#beddf3' },
  { label: '35', value: 35, color: '#D8BFD8' },
  { label: '40', value: 40, color: '#F4A300' },
])

const wheelRef = ref<HTMLDivElement | null>(null)
const spinning = ref(false)
const resetting = ref(false)
const rotation = ref(0)
const resultIndex = ref<number | null>(null)

const degPer = computed(() => 360 / segments.value.length)

const wheelBackground = computed(
  () =>
    `conic-gradient(${segments.value
      .map((s, i) => `${s.color} ${i * degPer.value}deg ${(i + 1) * degPer.value}deg`)
      .join(', ')})`,
)

const wheelStyle = computed<CSSProperties>(() => ({
  width: `${SIZE}px`,
  height: `${SIZE}px`,
  borderRadius: '50%',
  background: wheelBackground.value,
  transform: `rotate(${rotation.value}deg) translateZ(0)`,
  transition: spinning.value
    ? `transform ${SPIN_DURATION}ms cubic-bezier(.22,.9,.31,1)`
    : resetting.value
      ? `transform ${RESET_DURATION}ms ease-in-out`
      : 'none',
  position: 'relative',
  overflow: 'hidden',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
}))

async function spinWheel() {
  if (spinning.value || resetting.value || !canSpin.value) return

  const res = await spin()
  if (!res || res.prize == null) return

  const index = segments.value.findIndex((s) => s.value === res.prize)
  if (index === -1) return

  spinning.value = true
  resultIndex.value = index

  const segmentCenter = index * degPer.value + degPer.value / 2
  rotation.value = SPINS * 360 + (POINTER_ANGLE - segmentCenter)
}

async function reset() {
  if (resetting.value || !wheelRef.value) return

  const normalized = ((rotation.value % 360) + 360) % 360
  if (normalized === 0) {
    rotation.value = 0
    spinning.value = false
    resetting.value = false
    resultIndex.value = null
    return
  }

  resetting.value = true
  spinning.value = false

  rotation.value = normalized
  await nextTick()

  rotation.value -= normalized
  resultIndex.value = null
}

function onTransitionEnd(e: TransitionEvent) {
  if (e.target !== wheelRef.value) return
  if (e.propertyName !== 'transform') return

  if (spinning.value) {
    setTimeout(() => reset(), 1000)
    return
  }

  if (resetting.value) {
    resetting.value = false
  }
}

function labelStyle(index: number): CSSProperties {
  const angle = degPer.value * index + degPer.value / 2
  const distance = SIZE * 0.42

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: '0 0',
    transform: `rotate(${angle}deg) translate(${distance}px, -50%) rotate(90deg)`,
    color: '#fff',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }
}

onMounted(async () => {
  await fetchStatus()
})
</script>

<template>
  <LoaderComponent v-if="isLoading" />

  <div class="spin-wheel-wrapper">
    <SpinPointerIcon class="w-6 -mb-5 z-10 text-[#eaf3f9]" />

    <div
      ref="wheelRef"
      class="wheel border-[#eaf3f9] border-8"
      :style="wheelStyle"
      @transitionend="onTransitionEnd"
    >
      <div
        v-for="(segment, i) in segments"
        :key="segment.value"
        class="label"
        :style="labelStyle(i)"
      >
        {{ segment.label }}
      </div>
    </div>

    <button
      class="w-40 mt-4 disabled:opacity-50"
      :disabled="spinning || resetting || !canSpin"
      @click="spinWheel"
    >
      <img :src="SpinButtonImage" alt="spin" />
    </button>

    <div v-if="cooldownRemaining" class="text-xs font-bold mt-2">
      Next spin in:
      {{ cooldownRemaining.hours }}h {{ cooldownRemaining.minutes }}m
      {{ cooldownRemaining.seconds }}s
    </div>
  </div>
</template>

<style scoped>
.spin-wheel-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wheel {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.label {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
