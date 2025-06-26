export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <main>{children}</main>
    </div>
  )
}
