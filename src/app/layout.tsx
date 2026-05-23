import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s | CMMC Compliance System',
    default: 'CMMC Compliance System',
  },
  description: 'CMMC Level 1/2 인증 준비를 위한 AS-IS 점검·갭 분석·POA&M 추적 관리 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
