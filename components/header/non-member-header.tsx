'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BsStars } from 'react-icons/bs'
import { LuUserRound } from 'react-icons/lu'
import { RiRobot2Line } from 'react-icons/ri'

const navItems = [
  { href: '/ai-chat', label: 'AIチャット', icon: RiRobot2Line },
  { href: '/match', label: 'マッチング', icon: BsStars },
] as const

const logInNav = {
  title: 'ログイン',
  items: [
    { href: 'https://candidate.seijiselect.jp', label: '政治家の方', icon: LuUserRound },
    { href: 'https://assist.seijiselect.jp', label: '支援者の方', icon: LuUserRound },
  ],
} as const

export default function NonMemberHeader() {
  const pathname = usePathname()
  const linkClass = 'flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'
  const loginPaths = logInNav.items.map((i) => i.href)
  const isLoginActive = loginPaths.some((p) => pathname === p)

  return (
    <div className='hidden md:flex items-center gap-6'>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        const linkClass = 'flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'
        const activeClass = 'text-primary'
        const inactiveClass = 'text-[#333]'
        return (
          <Link key={href} href={href} className={linkClass}>
            <Icon className={cn('text-2xl transition-colors duration-300 group-hover:text-primary', isActive ? activeClass : inactiveClass)} />
            <span className={cn('transition-colors duration-300 group-hover:text-primary', isActive ? activeClass : inactiveClass)}>
              {label}
            </span>
          </Link>
        )
      })}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn('group', linkClass, 'outline-none rounded-md', 'data-[state=open]:text-primary [&_svg]:transition-colors [&_svg]:duration-300', isLoginActive ? 'text-primary' : 'text-[#333]')}
        >
          <LuUserRound
            className={cn('text-2xl transition-colors duration-300 group-hover:text-primary group-data-[state=open]:text-primary', isLoginActive ? 'text-primary' : 'text-[#333]')}
          />
          <span
            className={cn(
              'transition-colors duration-300 group-hover:text-primary group-data-[state=open]:text-primary',
              isLoginActive ? 'text-primary' : 'text-[#333]'
            )}
          >
            {logInNav.title}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={8}
          className='min-w-[14rem] rounded-xl border border-border/50 bg-white p-2 shadow-lg'
        >
          <DropdownMenuLabel className='px-3 py-2 text-xs font-semibold text-muted-foreground'>
            {logInNav.title}
          </DropdownMenuLabel>
          {logInNav.items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <DropdownMenuItem
                key={href}
                asChild
                className={cn(
                  'cursor-pointer rounded px-3 py-2.5 text-sm font-medium text-[#333]',
                  'focus:bg-primary/10 focus:text-primary',
                  'data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <Link href={href} className='flex w-full items-center gap-2'>
                  <Icon className='text-xl shrink-0' />
                  {label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
