'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
    const path = usePathname();
    
    if (path === '/game-play' || path ==='/') return;

  return (
    <div className='flex items-baseline justify-center gap-[60px] h-[103px] bg-[#171717] absolute bottom-0 z-20 w-full'>
        <Link href='/profile' className='inline-flex flex-col items-center'>
            {path === '/profile' ? (<Image src='/profile-active.png' alt='profile' width={26} height={26} />) :(<Image src='/profile.png' alt='profile' width={26} height={26} />)}
            <span className={`${path === '/profile' ? "text-primary" : "text-white"} text-[14px]`}>Profile</span>
        </Link>

        <Link href='/play' className='inline-flex flex-col items-center relative -mt-8'>
            {path === '/play' || path === '/create-game' ? (<Image className='z-10' src='/play-active.png' alt='profile' width={82} height={82} />) :(<Image className='z-10' src='/play.png' alt='profile' width={82} height={82} />)}
            <span className={`${path === '/play' || path === '/create-game' ? "text-primary" : "text-white"} text-[14px]`}>play</span>
        </Link>

        <Link href='/wallet' className='inline-flex flex-col items-center'>
            {path === '/wallet' ? (<Image src='/wallet-active.png' alt='wallet' width={26} height={26} />) :(<Image src='/wallet.png' alt='wallet' width={26} height={26} />)}
            <span className={`${path === '/wallet' ? "text-primary" : "text-white"} text-[14px]`}>Wallet</span>
        </Link>
    </div>
  )
}
