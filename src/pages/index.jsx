import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/components/auth/AuthProvider'
import { PAGE_PATHS } from '@/lib/auth'

export default function IndexPage() {
  const router = useRouter()
  const { session, ready } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (session) {
      router.replace(PAGE_PATHS[session.defaultPage])
    }
  }, [ready, session, router])

  return null
}
