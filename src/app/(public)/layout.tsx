export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="">
      {/* <h1>Public</h1> */}
      {children}
    </div>
  )
}
