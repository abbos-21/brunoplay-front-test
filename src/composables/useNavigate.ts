import { useRouter } from 'vue-router'

export function useNavigate() {
  const router = useRouter()

  function goTo(path: string) {
    router.push(path)
  }

  return { goTo }
}
