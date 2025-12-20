<script setup lang="ts">
import { ref } from 'vue'
import { AdsgramTask } from '@adsgram/vue'

const taskBlockId = import.meta.env.VITE_TASK_BLOCK_ID

const handleReward = () => {
  console.log('Reward confirmed by Adsgram')
}

const handleError = (event: CustomEvent<string>) => {
  console.error('Task error:', event.detail)
}

const rawHtml = ref<string>(
  "<span slot='reward' className='task__reward'>1000 coins</span><div slot='button' className='task__button'>go</div><div slot='claim' className='task__button_claim'>claim</div><div slot='done' className='task__button_done'>done</div>",
)
</script>

<template>
  <div class="my-4 flex flex-col gap-4 overflow-y-scroll scrollbar-hide">
    <AdsgramTask
      :blockId="taskBlockId"
      :debug="true"
      class="task"
      :onReward="handleReward"
      :onError="handleError"
      v-html="rawHtml"
    >
    </AdsgramTask>
  </div>
</template>
