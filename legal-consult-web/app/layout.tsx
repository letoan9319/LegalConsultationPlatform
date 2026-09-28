import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lexima | Precision Legal Consultation',
  description: 'Legal Consultation Platform. Connect with expert attorneys and AI-powered legal intelligence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
