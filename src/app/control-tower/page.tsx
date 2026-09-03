import type { Metadata } from 'next'
import { ControlTowerPage } from '@/components/personas/ControlTowerPage'

export const metadata: Metadata = {
  title: 'Control Tower',
}

export default function ControlTowerRoute() {
  return <ControlTowerPage />
}
