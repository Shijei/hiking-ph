import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hiking PH',
  description: 'The Filipino hiking community — agencies, mountains, and stories.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-[#FAF7F2] text-gray-900 min-h-screen`}>
        <div className="max-w-lg mx-auto min-h-screen pb-24">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}