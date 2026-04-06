import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

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
      <body className={`${dmSans.variable} font-sans bg-[#FAF7F2] text-gray-900 min-h-screen`}>
        <div className="max-w-lg mx-auto min-h-screen pb-24">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  )
}