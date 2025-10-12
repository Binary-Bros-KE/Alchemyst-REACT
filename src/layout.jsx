import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata = {
  title: "Alchemyst - Kenya's Premier Escort Platform",
  description: "Safe and professional platform connecting providers and clients in Kenya",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
