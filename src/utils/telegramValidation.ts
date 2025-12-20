import WebApp from '@twa-dev/sdk'

export function useTelegram() {
  const isTelegram = !!window.Telegram?.WebApp
  const user = WebApp.initDataUnsafe?.user

  const ensureTelegramAccess = () => {
    if (import.meta.env.MODE === 'development') {
      return
    }

    if (!isTelegram || !user) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">
          <div>
            <h2>Access Denied 🚫</h2>
            <p>Please open this app inside <b>Telegram</b>.</p>
          </div>
        </div>
      `
      throw new Error('Not in Telegram environment')
    }
  }

  return { WebApp, isTelegram, user, ensureTelegramAccess }
}
