<script setup lang="ts">
import { AdsgramTask } from '@adsgram/vue'

const taskBlockId = import.meta.env.VITE_TASK_BLOCK_ID || 'task-19591'

const handleReward = (event: CustomEvent<string>): void => {
  console.log('User earned reward:', event.detail)
}

const handleError = (event: CustomEvent<string>): void => {
  console.error('Task error:', event.detail)
}
</script>

<template>
  <AdsgramTask
    :blockId="taskBlockId"
    data-debug="true"
    class="task"
    :onReward="handleReward"
    :onError="handleError"
  >
    <template v-slot:reward>
      <span className="task__reward">100 coins</span>
    </template>
    <template v-slot:button>
      <div className="task__button">go</div>
    </template>
    <template v-slot:claim>
      <div className="task__button_claim">claim</div>
    </template>
    <template v-slot:done>
      <div className="task__button_done">done</div>
    </template>
  </AdsgramTask>
</template>

<style scoped>
.task {
}
</style>
