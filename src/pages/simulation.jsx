import Head from 'next/head'
import { SimulationPage } from '@/components/simulation/SimulationPage'

export default function SimulationRoute() {
  return (
    <>
      <Head>
        <title>Simulation | BFL Digital Twin</title>
      </Head>
      <SimulationPage />
    </>
  )
}
