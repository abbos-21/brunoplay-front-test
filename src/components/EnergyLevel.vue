<script setup lang="ts">
import { computed } from 'vue'
import { FlashImage } from '@/assets/images/winter'

interface Props {
  currentValue?: number
  maxValue?: number
  minValue?: number
  unit?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  showGlow?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentValue: 80,
  maxValue: 100,
  minValue: 0,
  unit: 'min',
  color: 'blue',
  showGlow: true,
  animated: true,
})

const percentage = computed(() => {
  const range = props.maxValue - props.minValue
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((props.currentValue - props.minValue) / range) * 100))
})

const energyBarClass = computed(() => [`energy-bar-${props.color}`, { animated: props.animated }])

const energyFillClass = computed(() => [
  `energy-fill-${props.color}`,
  { pulse: props.animated && percentage.value > 80 },
])

const segments = Array.from({ length: 10 }, (_, i) => i + 1)
</script>

<template>
  <div class="energy-container-vertical">
    <div class="energy-label">
      <span class="energy-text"> {{ Math.round(currentValue / 60) }} {{ unit }} </span>
    </div>

    <div class="energy-bar" :class="energyBarClass">
      <div class="energy-fill" :class="energyFillClass" :style="{ height: `${percentage}%` }">
        <div v-if="showGlow" class="energy-glow" />
      </div>

      <div class="energy-segments-vertical">
        <div
          v-for="segment in segments"
          :key="segment"
          class="energy-segment"
          :class="{ active: segment <= percentage / 10 }"
        />
      </div>
    </div>

    <div class="energy-icon">
      <img :src="FlashImage" class="w-8" alt="Energy" />
    </div>
  </div>
</template>

<style scoped>
.energy-container-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.energy-label {
  text-align: center;
}

.energy-text {
  font-weight: bold;
  font-size: 14px;
  color: #f5e4a9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.energy-bar {
  position: relative;
  width: 14px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #333;
  background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column-reverse;
}

.energy-bar-blue {
  border-color: #74d4ff;
}
.energy-bar-green {
  border-color: #16a34a;
}
.energy-bar-red {
  border-color: #dc2626;
}
.energy-bar-yellow {
  border-color: #ca8a04;
}
.energy-bar-purple {
  border-color: #9333ea;
}

.energy-fill {
  width: 100%;
  transition: height 0.4s ease;
  position: relative;
}

.energy-fill-blue {
  background: linear-gradient(180deg, #00bcff, #00a6f4);
}
.energy-fill-green {
  background: linear-gradient(180deg, #22c55e, #15803d);
}
.energy-fill-red {
  background: linear-gradient(180deg, #ef4444, #b91c1c);
}
.energy-fill-yellow {
  background: linear-gradient(180deg, #facc15, #a16207);
}
.energy-fill-purple {
  background: linear-gradient(180deg, #a855f7, #7c3aed);
}

.energy-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.energy-segments-vertical {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  padding: 2px;
}

.energy-segment {
  flex: 1;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
}

.energy-segment.active {
  background: rgba(255, 255, 255, 0.12);
}

.energy-icon img {
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}

@keyframes shimmer {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(-100%);
  }
}
</style>
