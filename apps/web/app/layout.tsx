import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CodeArena - Multiplayer DSA Challenge Platform',
  description: 'Real-time collaborative coding platform for DSA challenges, mock interviews, and competitive programming.',
  keywords: ['coding', 'programming', 'DSA', 'algorithms', 'interview prep', 'competitive programming'],
  authors: [{ name: 'CodeArena Team' }],
  openGraph: {
    title: 'CodeArena - Multiplayer DSA Challenge Platform',
    description: 'Join multiplayer coding sessions, practice with AI, and compete with friends!',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}