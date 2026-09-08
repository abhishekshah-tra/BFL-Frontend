import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function HelpPage() {
  return (
    <>
      <Head>
        <title>Help & Support | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Help & Support"
        description="Guides and support contacts will appear here."
      />
    </>
  )
}
