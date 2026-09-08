import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function WarehouseNetworkPage() {
  return (
    <>
      <Head>
        <title>Warehouse Network | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Warehouse Network"
        description="Warehouse topology and capacity views will appear here."
      />
    </>
  )
}
