import Head from 'next/head'
import { WarehouseNetworkPage } from '@/components/network/WarehouseNetworkPage'

export default function WarehouseNetworkRoute() {
  return (
    <>
      <Head>
        <title>Warehouse Network | BFL Digital Twin</title>
      </Head>
      <WarehouseNetworkPage />
    </>
  )
}
