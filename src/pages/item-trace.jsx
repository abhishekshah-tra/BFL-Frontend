import Head from 'next/head'
import { EndToEndTracePage } from '@/components/pages/EndToEndTracePage'

export default function ItemTraceRoute() {
  return (
    <>
      <Head>
        <title>End to End Item Trace | BFL Digital Twin</title>
        <meta
          name="description"
          content="Real-time visibility of an item's journey across the supply chain and warehouse network"
        />
      </Head>
      <EndToEndTracePage />
    </>
  )
}
