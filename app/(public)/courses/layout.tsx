import { Toaster } from '@/components/ui/toaster'

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="mt-[-37px] min-h-screen">
      {children}
      <Toaster />
    </main>
  )
}
