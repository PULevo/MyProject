import type { Metadata } from "next"
import { Bricolage_Grotesque, Epilogue } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
})

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "MyProject",
  description: "Project and task management for small teams",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${epilogue.variable}`}>
      <body className="antialiased bg-bg min-h-screen">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181e",
              border: "1px solid #25252f",
              color: "#ede8f5",
              fontFamily: "var(--font-epilogue, ui-sans-serif)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  )
}
