import { FaHome, FaLine, FaTiktok } from 'react-icons/fa'
import { FaFacebook, FaLinkedin, FaSquareInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6'

export const WEBSITE_ICONS: Record<string, React.ReactNode> = {
  homepage: <FaHome className='h-7 w-7 text-gray-600' />,
  facebook: <FaFacebook className='h-7 w-7 text-[#1877F2]' />,
  twitter: <FaXTwitter className='h-7 w-7 text-black' />,
  youtube: <FaYoutube className='h-7 w-7 text-[#FF0000]' />,
  line: <FaLine className='h-7 w-7 text-[#00C300]' />,
  instagram: <FaSquareInstagram className='h-7 w-7 text-[#E4405F]' />,
  tiktok: <FaTiktok className='h-7 w-7 text-black' />,
  linkedin: <FaLinkedin className='h-7 w-7 text-[#0A66C2]' />,
}