import type React from "react"
import Link from "next/link"
import "./globals.css"

export const metadata = {
  title: "Plens - Microplastic Checker",
  description: "Check products for microplastics",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderBottom: "1px solid #ccc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <Link href="/" style={{ fontWeight: "bold", color: "green", fontSize: "20px" }}>
              PLENS
            </Link>
            <nav>
              <Link href="/" style={{ marginRight: "10px", color: "black", textDecoration: "none" }}>
                Home
              </Link>
              <Link href="/previous-searches" style={{ marginRight: "10px", color: "black", textDecoration: "none" }}>
                History
              </Link>
              <Link href="/profile" style={{ marginRight: "10px", color: "black", textDecoration: "none" }}>
                Profile
              </Link>
              <Link href="/contact" style={{ color: "black", textDecoration: "none" }}>
                Contact
              </Link>
            </nav>
            <div>
              <Link href="/login">
                <button
                  style={{
                    marginRight: "10px",
                    padding: "5px 10px",
                    border: "1px solid #ccc",
                    background: "white",
                  }}
                >
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </header>
        {children}
        <footer
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderTop: "1px solid #ccc",
            textAlign: "center",
          }}
        >
          <p>© 2023 Plens. All rights reserved.</p>
          <div style={{ marginTop: "10px" }}>
            <a href="#" style={{ marginRight: "10px", color: "black", textDecoration: "none" }}>
              About
            </a>
            <a href="#" style={{ marginRight: "10px", color: "black", textDecoration: "none" }}>
              Privacy
            </a>
            <a href="#" style={{ color: "black", textDecoration: "none" }}>
              Terms
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}