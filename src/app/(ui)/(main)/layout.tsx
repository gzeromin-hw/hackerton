import Header from './_header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-pattern-grid min-h-screen">
      <Header />
      {children}
    </div>
  )
}
