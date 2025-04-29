import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ThemeProvider } from "@/components/theme-provider"
import NextTopLoader from 'nextjs-toploader';
import StoreProvider from "@/redux/provider"
import { ToastContainer } from "react-toastify"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Destiny Builders Empowerment Foundation",
  description: "Building African Destinies, Transforming Lives",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <NextTopLoader />
      <ToastContainer position="top-right" autoClose={3000} />

      <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="text-gray-900 bg-gray-50 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </StoreProvider>

      </body>
    </html>
  )
}
