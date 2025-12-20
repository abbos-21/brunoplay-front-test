import '@/assets/styles/main.css'
import 'vue3-toastify/dist/index.css'
import "animate.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useTelegram } from './utils/telegramValidation'

const { ensureTelegramAccess } = useTelegram()

ensureTelegramAccess()
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
