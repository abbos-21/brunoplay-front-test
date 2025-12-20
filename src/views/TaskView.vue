<script setup lang="ts">
import { inject, onMounted } from 'vue'
import WebApp from '@twa-dev/sdk'
import { TealSnowBackgroundImage } from '@/assets/backgrounds/winter'

const navHeight = inject('navHeight')

onMounted(() => {
  WebApp.ready()
  WebApp.expand()
})
</script>

<template>
  <div
    class="w-full h-full bg-cover bg-center bg-no-repeat p-2 relative flex flex-col"
    :style="{ backgroundImage: `url(${TealSnowBackgroundImage})`, paddingBottom: `${navHeight}px` }"
  >
    <div class="flex flex-col gap-2 items-center">
      <h1 class="uppercase text-center text-white text-lg font-bold">task list</h1>

      <div class="flex justify-center gap-4 items-center">
        <RouterLink to="/tasks/main" class="tab" active-class="active"> Main </RouterLink>
        <RouterLink to="/tasks/partner" class="tab" active-class="active"> Partner </RouterLink>
      </div>
    </div>

    <RouterView />
  </div>
</template>

<style scoped>
.tab {
  background: transparent;
  border: 1px solid white;
  color: white;
  font-weight: bold;
  border-radius: 9999px;
  text-align: center;
  padding: 0.25rem 2rem;
}

.active {
  background: rgba(4, 4, 4, 0.75);
  border-color: rgba(4, 4, 4, 0.75);
}
</style>
