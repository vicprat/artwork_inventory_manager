
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
      >
        <QueryProvider>

        {children}
        </QueryProvider>
      </body>
    </html>
  )
}