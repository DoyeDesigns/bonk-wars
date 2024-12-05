import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Play() {
  return (
    <div className='h-full overflow-auto bg-background flex flex-col justify-center'>
        <div className='h-full'>
            <h1 className='pb-4 pt-9 font-bold text-white pl-4'>Find Game</h1>
            <label className="input !bg-[#919090]/50 input-bordered flex items-center gap-2 mx-4 mb-4">
                <Image src='/search.png' alt='search' width={24} height={24} />
                <input type="text" className="grow border-none h-[54px] text-white" placeholder="Search User Game ID" />
            </label>
            <div className='flex flex-col items-center mx-4 gap-4'>
                <Link href='/game-play' className='btn h-12 bg-primary w-full text-white'>Search User Game ID</Link>
                <Link href='/create-game' className='btn h-12 bg-secondary w-full text-black'>Create Game</Link>
                <Link href='/test' className='btn h-12 bg-secondary w-full text-black'>test local</Link>
                <Link href='/online-test' className='btn h-12 bg-secondary w-full text-black'>test online</Link>
            </div>
        </div>
    </div>
  )
}
