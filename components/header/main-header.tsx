'use client'

import MemberHeader from '@/components/header/member-header'
import NonMemberHeader from '@/components/header/non-member-header'
import { useAuth } from '@/providers/auth-provider'
import Image from 'next/image'
import Link from 'next/link'

const MainHeader = () => {
  const { user_role } = useAuth()
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center justify-between w-full max-w-[1400px] px-4 mx-auto'>
        <Link href='/' className='py-1'>
          <Image src='/images/logo.png' alt='わたしの政治ロゴ' width={142} height={78} priority />
        </Link>
        {user_role ? <MemberHeader /> : <NonMemberHeader />}
      </div>
    </header>
  )
}

export default MainHeader