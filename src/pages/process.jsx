import Head from 'next/head'
import { ProcessPage } from '@/components/personas/ProcessPage'

export default function ProcessRoute() {
  return (
    <>
      <Head>
        <title>Process Details | BFL Digital Twin</title>
      </Head>
      <ProcessPage />
    </>
  )
}
