<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentValue: number
  maxValue: number
  minValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  minValue: 0,
})

const progressPercentage = computed(() => {
  const range = props.maxValue - props.minValue
  const current = props.currentValue - props.minValue
  return Math.min(100, Math.max(0, (current / range) * 100))
})
</script>

<template>
  <div class="container">
    <div class="progress relative">
      <span class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">{{
        currentValue.toFixed(2)
      }}</span>
      <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  font-weight: bold;
  color: white;
}

.progress {
  padding: 4px;
  background: rgba(0, 0, 0, calc(0.25 + 0.25 / 4));
  border-radius: 6px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.25),
    0 1px rgba(255, 255, 255, 0.08);
}

.progress-bar {
  height: 24px;
  background-color: #74d4ff;
  border-radius: 4px;
  transition: width 0.4s linear;
  background-image: linear-gradient(
    45deg,
    #00bcff 25%,
    transparent 25%,
    transparent 50%,
    #00bcff 50%,
    #00bcff 75%,
    transparent 75%,
    transparent
  );
}
</style>
