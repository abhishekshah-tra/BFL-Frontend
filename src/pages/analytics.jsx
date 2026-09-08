import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function AnalyticsPage() {
  return (
    <>
      <Head>
        <title>Analytics & Reports | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Analytics & Reports"
        description="SLA and network analytics will appear here."
      />
    </>
  )
}
