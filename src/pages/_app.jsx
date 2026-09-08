import Head from 'next/head'
import { Inter } from 'next/font/google'
import { AuthGate } from '@/components/auth/AuthGate'
import '@/styles/globals.css'
import '@/styles/personas.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BFL Digital Twin</title>
        <meta
          name="description"
          content="Real-time visibility of an item's journey across the supply chain and warehouse network"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <div className={inter.className}>
        <AuthGate>
          <Component {...pageProps} />
        </AuthGate>
      </div>
    </>
  )
}
