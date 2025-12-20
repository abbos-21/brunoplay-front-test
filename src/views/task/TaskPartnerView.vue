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
  <div class="my-4 flex flex-col gap-4 overflow-y-scroll scrollbar-hide">
    <AdsgramTask
      :blockId="taskBlockId"
      :debug="true"
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
        <div class="task__button task__button_claim">Claim</div>
      </template>

      <template #done>
        <div class="task__button task__button_done">Done</div>
      </template>
    </AdsgramTask>
  </div>
</template>
