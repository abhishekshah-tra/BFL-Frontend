import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProcessPage } from '@/components/personas/ProcessPage'

export const metadata: Metadata = {
  title: 'Process Details',
}

export default function ProcessRoute() {
  return (
    <Suspense fallback={null}>
      <ProcessPage />
    </Suspense>
  )
}
