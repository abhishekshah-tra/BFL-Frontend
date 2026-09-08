import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function InventoryPage() {
  return (
    <>
      <Head>
        <title>Inventory | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Inventory"
        description="Inventory positions and ageing will appear here."
      />
    </>
  )
}
