import { onMounted, onUnmounted } from 'vue'
import createAdHandler from 'monetag-tg-sdk'

const MAIN_ZONE_ID = import.meta.env.VITE_MONETAG_ZONE_ID

export function useMonetagAdHandler(options?: {
  frequency?: number
  capping?: number
  interval?: number
  timeout?: number
  everyPage?: boolean
  debug?: boolean
}) {
  let stopHandler: (() => Promise<void>) | null = null

  onMounted(() => {
    const handler = createAdHandler(MAIN_ZONE_ID)

    if (options?.debug) {
      console.log('[Monetag] Ad handler initializing…')
    }

    const result = handler({
      type: 'inApp',
      inAppSettings: {
        frequency: options?.frequency ?? 10,
        capping: options?.capping ?? 1,
        interval: options?.interval ?? 300,
        timeout: options?.timeout ?? 5,
        everyPage: options?.everyPage ?? false,
      },
    })

    if (typeof result === 'function') {
      stopHandler = result
    }

    if (options?.debug) {
      console.log('[Monetag] Handler started with:', options)
    }
  })

  onUnmounted(() => {
    if (options?.debug) {
      console.log('[Monetag] Cleaning up Monetag handler…')
    }

    if (stopHandler) {
      stopHandler().catch((err) => {
        console.error('[Monetag] Cleanup error:', err)
      })
    }
  })
}
