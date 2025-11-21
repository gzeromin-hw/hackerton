import type { Metadata } from 'next'
import '../globals.css'
import ToastContainer from '@/components/ToastContainer'

export const metadata: Metadata = {
  title: 'Roltimate',
  description: '할네즈 해커톤',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`antialiased`} suppressHydrationWarning>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
