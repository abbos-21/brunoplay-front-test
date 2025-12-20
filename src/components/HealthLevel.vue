<script setup lang="ts">
import { computed } from 'vue'
import { HeartImage } from '@/assets/images/winter'

interface Props {
  currentValue?: number
  maxValue?: number
  minValue?: number
  color?: 'green' | 'red' | 'yellow' | 'blue'
  showGlow?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentValue: 100,
  maxValue: 100,
  minValue: 0,
  color: 'green',
  showGlow: true,
  animated: true,
})

const percentage = computed(() => {
  const range = props.maxValue - props.minValue
  if (range <= 0) return 0
  return Math.min(100, Math.max(0, ((props.currentValue - props.minValue) / range) * 100))
})

const healthBarClass = computed(() => [`health-bar-${props.color}`, { animated: props.animated }])

const healthFillClass = computed(() => [
  `health-fill-${props.color}`,
  { pulse: props.animated && percentage.value > 80 },
])

const segments = Array.from({ length: 10 }, (_, i) => i + 1)
</script>

<template>
  <div class="health-container-vertical">
    <div class="health-label">
      <span class="health-text">{{ Math.round(percentage) }}%</span>
    </div>

    <div class="health-bar" :class="healthBarClass">
      <div
        class="health-fill"
        :class="healthFillClass"
        :style="{ height: `${Math.round(percentage)}%` }"
      >
        <div v-if="showGlow" class="health-glow" />
      </div>

      <div class="health-segments-vertical">
        <div
          v-for="segment in segments"
          :key="segment"
          class="health-segment"
          :class="{ active: segment <= percentage / 10 }"
        />
      </div>
    </div>

    <div class="health-icon">
      <img :src="HeartImage" class="w-8" alt="Health" />
    </div>
  </div>
</template>

<style scoped>
.health-container-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.health-label {
  text-align: center;
}

.health-text {
  font-weight: bold;
  font-size: 14px;
  color: #f5e4a9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.health-bar {
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

.health-bar-green {
  border-color: #46edd5;
}
.health-bar-red {
  border-color: #dc2626;
}
.health-bar-yellow {
  border-color: #ca8a04;
}
.health-bar-blue {
  border-color: #2563eb;
}

.health-fill {
  width: 100%;
  transition: height 0.4s ease;
  position: relative;
}

.health-fill-green {
  background: linear-gradient(180deg, #00d5be, #00bba7);
}
.health-fill-red {
  background: linear-gradient(180deg, #ef4444, #b91c1c);
}
.health-fill-yellow {
  background: linear-gradient(180deg, #facc15, #a16207);
}
.health-fill-blue {
  background: linear-gradient(180deg, #3b82f6, #1e40af);
}

.health-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.health-segments-vertical {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  padding: 2px;
}

.health-segment {
  flex: 1;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
}

.health-segment.active {
  background: rgba(255, 255, 255, 0.12);
}

.health-icon img {
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
