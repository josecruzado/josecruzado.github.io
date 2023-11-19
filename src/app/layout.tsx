import Dock from '@/components/dock/Dock'
import '../../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Jose Cruzado Portfolio ',
  description: 'Portfolio created with nextjs and tailwind.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Dock/>
      </body>
    </html>
  )
}
