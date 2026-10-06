import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TourFlow AI',
  description: 'Personalized Dynamic Tour Planning & Tour Operations Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
