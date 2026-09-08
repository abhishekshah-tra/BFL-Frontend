import Head from 'next/head'
import { ControlTowerPage } from '@/components/personas/ControlTowerPage'

export default function ControlTowerRoute() {
  return (
    <>
      <Head>
        <title>Control Tower | BFL Digital Twin</title>
      </Head>
      <ControlTowerPage />
    </>
  )
}
