import Head from 'next/head'
import { Inter } from 'next/font/google'
import { AuthGate } from '@/components/auth/AuthGate'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css'
import '@/styles/personas.css'
import '@/styles/warehouse-network.css'
import '@/styles/simulation.css'
import '@/styles/scenarios.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>BFL Group | Digital Twin</title>
        <meta
          name="description"
          content="BFL Group warehouse operations — JAFZA to TECHNO digital twin"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <div className={inter.className}>
        <AuthGate>
          <Component {...pageProps} />
        </AuthGate>
      </div>
    </>
  )
}
