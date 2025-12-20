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
    :debug="true"
    class="task"
    :onReward="handleReward"
    :onError="handleError"
  >
    <template v-slot:reward>
      <span className="task__reward">1000 coins</span>
    </template>
    <template v-slot:button>
      <div className="task__button">go</div>
    </template>
    <template v-slot:claim>
      <div className="task__button task__button_claim">claim</div>
    </template>
    <template v-slot:done>
      <div className="task__button task__button_done">done</div>
    </template>
  </AdsgramTask>
</template>
