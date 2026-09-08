import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Home | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Home"
        description="Workspace overview will appear here."
      />
    </>
  )
}
