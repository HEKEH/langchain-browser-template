import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LangChain Web Template - AI Agent',
  description: 'AI Agent with frontend tool registration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

