import Head from 'next/head'
import { ScenariosPage } from '@/components/scenarios/ScenariosPage'

export default function ScenariosRoute() {
  return (
    <>
      <Head>
        <title>Scenarios | BFL Digital Twin</title>
      </Head>
      <ScenariosPage />
    </>
  )
}
