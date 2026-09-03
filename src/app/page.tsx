'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { PAGE_PATHS } from '@/lib/auth'

export default function RootPage() {
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
