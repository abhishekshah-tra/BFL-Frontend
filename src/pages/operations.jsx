import Head from 'next/head'
import { OperationsPage } from '@/components/personas/OperationsPage'

export default function OperationsRoute() {
  return (
    <>
      <Head>
        <title>Operations | BFL Digital Twin</title>
      </Head>
      <OperationsPage />
    </>
  )
}
