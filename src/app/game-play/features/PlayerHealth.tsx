import React from 'react'
import Image from 'next/image'

export default function PlayerHealth() {
  return (
    <div className='bg-[#E1C17B] h-10 w-[250px] rounded-2xl flex gap-3 px-2 items-center '>
      <Image src='/donald-pump.png' alt='donald-pump' width={45} height={60} className='rounded-[19px] mb-4'/>
      <div className='flex gap-[6px] flex-col -mt-2'>
        <span className='text-[10px] text-[#482007] font-bold'>Donald Pump</span>
        <progress className="progress progress-primary w-[163px] h-[9px] bg-white border-2 border-[#482007]" value={70} max="100"></progress>
      </div>
    </div>
  )
}

export function OpponentPlayerHealth() {
  return (
    <div className='bg-[#E1C17B] h-10 w-[250px] rounded-2xl flex flex-row-reverse gap-3 px-2 items-center '>
      <Image src='/vladmir-muffin.png' alt='donald-pump' width={45} height={60} className='rounded-[19px] mb-4'/>
      <div className='flex gap-[6px] flex-col -mt-2'>
        <span className='text-[10px] text-[#482007] text-right font-bold'>Vladmir Muffin</span>
        <progress className="progress progress-reverse progress-primary w-[163px] h-[9px] bg-white border-2 border-[#482007]" value={70} max="100"></progress>
      </div>
    </div>
  )
}
