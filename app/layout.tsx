import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileProvider } from "@/contexts/user-profile-context"
import { TutorialProvider } from "@/contexts/tutorial-context"
import { TutorialOverlay } from "@/components/tutorial-overlay"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "마음퇴근 - 직장인 감정 보호 앱",
  description: "직장인의 일상에 숨 쉴 틈을, 혼자만이 아닌 우리 모두의 감정 회복 공간",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <UserProfileProvider>
            <TutorialProvider>
              {children}
              <TutorialOverlay />
            </TutorialProvider>
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
