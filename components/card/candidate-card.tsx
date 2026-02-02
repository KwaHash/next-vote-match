import { TableCell, TableRow } from '@/components/ui/table'
import { getAgeFromBirthDate } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import Image from 'next/image'
// import Link from 'next/link'
// import { FaHome, FaLine, FaTiktok } from 'react-icons/fa'
// import { FaFacebook, FaLinkedin, FaSquareInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6'

export const CandidateCard = (politician: IPolitician) => {
  return (
    <TableRow
      className='hover:bg-gray-100 transition-all duration-300'
    >
      <TableCell className='border border-gray-300 text-center'></TableCell>
      <TableCell className='border border-gray-300 text-center p-1.5'>
        <div className='w-full h-40 relative overflow-hidden'>
          <Image
            src={politician.avatar || ''}
            alt={politician.kanji_name}
            fill
            className='object-cover'
          />
        </div>
      </TableCell>
      <TableCell className='border border-gray-300 text-center leading-8'>
        <p className='text-lg font-bold'>{politician.kanji_name}</p>
        <p className='text-sm'>{politician.hiragana_name}</p>
        <span className='text-sm font-normal'>({getAgeFromBirthDate(politician.birth_date)})</span>
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
        {politician.party || '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
        —
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.shin || '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.shu_count}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.proportional ? '重複' : '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
        {/* <div className='flex flex-wrap items-center gap-2'>
          {politician.website && (
            <Link
              href={politician.website}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaHome className='h-7 w-7 text-gray-600' />
            </Link>
          )}
          {politician.facebook && (
            <Link
              href={politician.facebook}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaFacebook className='h-7 w-7 text-[#1877F2]' />
            </Link>
          )}
          {politician.twitter && (
            <Link
              href={politician.twitter}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaXTwitter className='h-7 w-7 text-black' />
            </Link>
          )}
          {politician.youtube && (
            <Link
              href={politician.youtube}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaYoutube className='h-7 w-7 text-[#FF0000]' />
            </Link>
          )}
          {politician.line && (
            <Link
              href={politician.line}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaLine className='h-7 w-7 text-[#00C300]' />
            </Link>
          )}
          {politician.instagram && (
            <Link
              href={politician.instagram}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaSquareInstagram className='h-7 w-7 text-[#E4405F]' />
            </Link>
          )}
          {politician.tiktok && (
            <Link
              href={politician.tiktok}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaTiktok className='h-7 w-7 text-black' />
            </Link>
          )}
          {politician.linkedin && (
            <Link
              href={politician.linkedin}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='hover:opacity-80 transition-opacity'
            >
              <FaLinkedin className='h-7 w-7 text-[#0A66C2]' />
            </Link>
          )}
        </div> */}
      </TableCell>
    </TableRow>
  )
}

