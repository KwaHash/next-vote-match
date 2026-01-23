'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BsStars } from 'react-icons/bs'
import { FaListCheck, FaListUl } from 'react-icons/fa6'
import { HiOutlineInformationCircle } from 'react-icons/hi'

const MainHeader = () => {
  const pathname = usePathname()
  const MenuItems = [
    { label: 'わたしの政治とは', icon: HiOutlineInformationCircle, href: '/about' },
    { label: 'マッチング', icon: BsStars, href: '/match' },
    { label: '政治家一覧', icon: FaListUl, href: '/politicians' },
    { label: '衆議院選挙', icon: FaListCheck, href: '/candidates' },
  ]

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center justify-between w-full max-w-[1400px] px-8 mx-auto'>
        <Link href='/' className='py-1'>
          <Image src='/images/logo.png' alt='わたしの政治ロゴ' width={120} height={80} className='aspect-[3/2]' priority />
        </Link>
        <div className='flex items-center gap-4'>
          <div className='items-center space-x-6 hidden md:flex'>
            {MenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className='flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'
                >
                  <item.icon
                    className={`text-2xl transition-colors duration-300 ${isActive ? 'text-primary' : 'text-[#333]'} group-hover:text-primary`}
                  />
                  <span className={`group-hover:text-primary transition-colors duration-300 ${isActive ? 'text-primary' : 'text-[#333]'}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}

export default MainHeader