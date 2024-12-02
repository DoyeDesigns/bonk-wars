import React from 'react'
import Image from 'next/image'

export default function Wallet() {
  return (
    <div className='h-full overflow-auto bg-background flex flex-col text-center justify-center items-center'>
        <Image src='/create-game-header-img.png' alt='img' width={135} height={76} />
        <h1 className='font-bold text-[24px] mt-7 text-white'>Connect your wallet</h1>
        <p className='mt-4 text-white'>Hello Bonker!</p>
        <p className='mb-[91px] text-white'>Connect your wallet to get access to stake for battle</p>
        <button className='btn border-none rounded-[15px] h-[60px] font-bold text-[18px] text-white w-[354px] bg-accent'>Connect Wallet</button>
    </div>
  )
}
