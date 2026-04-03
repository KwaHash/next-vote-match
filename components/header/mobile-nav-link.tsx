'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

interface MobileNavLinkProps {
  icon: ReactNode;
  text: string;
  linkUrl: string;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  icon,
  text,
  linkUrl,
  onClick,
}) => {
  const pathName = usePathname()
  const isActive = pathName === linkUrl
  return (
    <Link
      href={linkUrl}
      onClick={onClick}
      className={`flex items-center justify-center py-4 font-bold transition-all duration-300 ease-out ${
        isActive
          ? 'text-indigo-700 bg-blue-50 rounded-lg'
          : 'text-gray-700 hover:text-indigo-700 hover:font-bold'
      }`}
    >
      <span className='text-2xl mr-2'>{icon}</span>
      <span>{text}</span>
    </Link>
  )
}

export default MobileNavLink
