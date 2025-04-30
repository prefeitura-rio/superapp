export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <h1>Private</h1>
      {children}
    </div>
  )
}
