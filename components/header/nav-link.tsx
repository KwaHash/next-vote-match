'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

interface NavLinkProps {
  icon: ReactNode;
  text: string;
  linkUrl: string;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, linkUrl }) => {
  const pathName = usePathname()
  const isActive = pathName === linkUrl
  return (
    <Link
      href={linkUrl}
      className={`flex items-center justify-center font-bold transition-all duration-300 ease-out ${
        isActive
          ? 'text-indigo-700'
          : 'text-gray-700 hover:text-indigo-700 hover:font-bold'
      }`}
    >
      <span className='text-xl mr-2'>{icon}</span>
      <span>{text}</span>
    </Link>
  )
}

export default NavLink
