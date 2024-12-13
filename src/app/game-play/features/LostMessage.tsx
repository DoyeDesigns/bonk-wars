'use client'

import React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import ExitGame from './ExitGame';
import { useRouter } from 'next/navigation';

export default function LostMessage() {
  const [showExitOptions, setShowExitOptions] = useState(false);
  const router = useRouter();

  const handleExitOptions = () => {
    setShowExitOptions(prev => !prev);
  }

  return (
    <div className='bg-[#191919]/60 h-full w-full top-0 left-0'>
      {showExitOptions ? (<ExitGame showExitOptions={showExitOptions} setShowExitOptions={setShowExitOptions} />) : (<div className='flex flex-col justify-center items-center h-screen'>
        <div className='flex justify-end w-[60%] -mt-20'>
          {/* <button><Image src='/close-overlay.png' alt='close-overlay' width={36} height={36} /></button> */}
        </div>
          <Image className='-mb-[115px] z-30' src='/sad-look.png' alt='lost-look' width={106} height={106} />
          <Image src='/winner-background.png' alt='winner-bg' width={306} height={306} />
          <div className='flex flex-col justify-center items-center gap-4 -mt-48'>
          <div className='flex flex-col justify-center items-center'>
              <span className='text-white font-extrabold text-[22px] text-center'>You Lost!!</span>
              <span className='text-white font-extrabold text-[22px] text-center'>1,000,000,000$BNK</span>
          </div>
          <button className='btn border-none bg-white text-primary font-bold text-[12px] w-[190px] rounded-[10px]'><Image src='/telegram-share.png' alt='winner-bg' width={24} height={24} /> Tell your friends</button>
          <button onClick={() => router.push('/create-game')} className='btn border-none bg-white text-primary font-bold text-[12px] w-[190px] rounded-[10px]'><Image src='/rematch.png' alt='winner-bg' width={24} height={24} /> Rematch</button>
          <button onClick={() => handleExitOptions()} className='btn border-none bg-white text-primary font-bold text-[12px] w-[190px] rounded-[10px]'><Image src='/exit.png' alt='winner-bg' width={24} height={24} /> Exit Game</button>
          </div>
      </div>)}
    </div>
  )
}
