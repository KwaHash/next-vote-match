import Providers from '@/app/providers'
import MainHeader from '@/components/header/main-header'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className='flex flex-col min-h-screen'>
        <MainHeader />
        <main className='flex flex-col w-full grow bg-[#eee] min-h-[calc(100dvh_-_88px)]'>
          {children}
        </main>
      </div>
    </Providers>
  )
}