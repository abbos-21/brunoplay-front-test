<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AdsgramTask } from '@adsgram/vue'
import WebApp from '@twa-dev/sdk'

const taskBlockId = import.meta.env.VITE_TASK_BLOCK_ID

const handleReward = () => {
  console.log('Reward confirmed by Adsgram')
}

const handleError = (event: CustomEvent<string>) => {
  console.error('Task error:', event.detail)
}

const rawHtml = ref<string>(
  "<span slot='reward' class='task__reward'>1000 coins</span><div slot='button' class='task__button'>go</div><div slot='claim' class='task__claim'>claim</div><div slot='done' className='task__done'>done</div>",
)

onMounted(() => {
  WebApp.ready()
})
</script>

<template>
  <div class="my-4 flex flex-col gap-4 overflow-y-scroll scrollbar-hide">
    <AdsgramTask
      :blockId="taskBlockId"
      :debug="false"
      class="task"
      :onReward="handleReward"
      :onError="handleError"
      v-html="rawHtml"
    >
    </AdsgramTask>
  </div>
</template>
