<script setup lang="ts">
import { AdsgramTask } from '@adsgram/vue'

const taskBlockId = import.meta.env.VITE_TASK_BLOCK_ID

const handleReward = () => {
  console.log('Reward confirmed by Adsgram')
}

const handleError = (event: CustomEvent<string>) => {
  console.error('Task error:', event.detail)
}
</script>

<template>
  <AdsgramTask
    :blockId="taskBlockId"
    debug
    class="task"
    :onReward="handleReward"
    :onError="handleError"
  >
    <template #reward>
      <span class="task__reward">+100 coins</span>
    </template>

    <template #button>
      <div class="task__button">Go</div>
    </template>

    <template #claim>
      <div class="task__button task__button--claim">Claim</div>
    </template>

    <template #done>
      <div class="task__button task__button--done">Done</div>
    </template>
  </AdsgramTask>
</template>

<style scoped>
.task {
  width: 100%;
}

.task__button {
  padding: 10px 16px;
  border-radius: 12px;
  background: #4f46e5;
  color: white;
  text-align: center;
  font-weight: 600;
}

.task__button--claim {
  background: #16a34a;
}

.task__button--done {
  background: #6b7280;
}

.task__reward {
  font-weight: 700;
  color: #facc15;
}
</style>
