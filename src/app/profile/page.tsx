'use client'

import React from 'react'
import Image from 'next/image'
import { useUser } from '@/contexts/telegram-context'
import PlayerStatistics from './features/PlayerStatistics';

export default function Profile() {
    const { user } = useUser();
  return (
    <main className='h-full overflow-auto bg-background flex flex-col justify-between'>
        <div>
        <div className='flex gap-5 justify-center pt-6 pb-8'>
            <div>
                <div className="avatar mt-2">
                    <div className="ring-[#f0b803] ring-offset-background w-[94px] h-[94px] rounded-full ring ring-offset-2">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
            </div>

            <div className='text-white'>
                <span className='block text-xl font-bold'>Jandounchaind</span>
                <span className='inline-flex items-center text-[15px] font-normal uppercase mt-2 mb-[14px]'>{user ? user?.id : "ID: 0A45R1AO"}  <button className='mt-px ml-2'><Image src='/copy.png' alt='copy' width={20} height={20} /></button></span>
                <button className='btn flex justify-center items-center border-none bg-accent h-10 w-[201px] text-white font-bold'><Image src='/wallet.png' alt='wallet' width={20} height={20}/> Connect Wallet</button>
            </div>
        </div>
        <div className="h-px bg-[#6A6868]"></div>
        <PlayerStatistics user={user} />
        </div>
    </main>
  )
}
