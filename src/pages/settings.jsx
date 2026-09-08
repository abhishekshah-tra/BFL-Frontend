import Head from 'next/head'
import { PlaceholderPage } from '@/components/pages/PlaceholderPage'

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings | BFL Digital Twin</title>
      </Head>
      <PlaceholderPage
        title="Settings"
        description="Workspace and user preferences will appear here."
      />
    </>
  )
}
