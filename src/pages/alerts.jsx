import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function AlertsPage() {
  return (
    <>
      <Head>
        <title>Alerts & Exceptions | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Alerts & Exceptions"
        description="Cross-network exception inbox will appear here."
      />
    </>
  )
}
