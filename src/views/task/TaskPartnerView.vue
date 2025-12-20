<script setup lang="ts">
import { ref } from 'vue'
import { AdsgramTask } from '@adsgram/vue'
import { toast } from 'vue3-toastify'

const taskBlockId = import.meta.env.VITE_TASK_BLOCK_ID

const handleReward = () => {
  toast.success('20 coins have been successfully added to your balance!')
}

const handleError = (event: CustomEvent<string>) => {
  console.error('Task error:', event.detail)
}

const rawHtml = ref<string>(
  "<span slot='reward' style='font-size: 14px; display: flex; align-items: center; gap: 4px;'><img src='/coin.png' style='width: 16px; height: 16px;' alt='coin-image' /> 100</span><div slot='button' style='background-color: #00bc7d; color: white; border-radius: 6px; padding: 4px 0; font-weight: bold;'>Go</div><div slot='claim' style='background-color: #ffac33; color: white; border-radius: 6px; padding: 4px 0; font-weight: bold;'>Claim</div><div slot='done' style='background-color: #00b8db; color: white; border-radius: 6px; padding: 4px 0; font-weight: bold;'>Done</div>",
)
</script>

<!-- eslint-disable -->
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
