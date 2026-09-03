'use client'

import type { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider, useAuth } from './AuthProvider'
import { LoginScreen } from './LoginScreen'

function Gate({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth()

  if (!ready) {
    return null
  }

  if (!session) {
    return (
      <div className="bfl-personas">
        <LoginScreen />
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}

export function AuthGate({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  )
}
