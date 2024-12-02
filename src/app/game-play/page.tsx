import React from 'react'
import PlayerHealth, { OpponentPlayerHealth } from './features/PlayerHealth'
import Image from 'next/image'
// import WonMessage from './features/WonMessage'
// import LostMessage from './features/LostMessage'

type ability = {
    name: string,
    value: number,
    type: string
}[]


const abilities : ability = [
  {
    name: 'name',
    value: 50,
    type: 'attack'
  },
  {
    name: 'punch gun',
    value: 10,
    type: 'attack'
  },
  {
    name: 'super attack',
    value: 50,
    type: 'attack'
  },
  {
    name: 'dodge',
    value: 1,
    type: 'defensive'
  },
  {
    name: 'block',
    value: 1,
    type: 'defensive'
  },
  {
    name: 'counter',
    value: 1,
    type: 'defensive'
  }
]

export default function Gameplay() {
  return (
    <div className='bg-[url("/game-play-bg.png")] bg-cover bg-no-repeat h-full overflow-auto  pt-[32px] relative'>
        <div className='flex flex-col gap-5 px-5'>
        <div>
            <PlayerHealth />
        </div>
        <div className='flex justify-end'>
        <OpponentPlayerHealth />
        </div>
        </div>
        <div className='flex flex-col items-center justify-center mt-10 mb-[46px]'>
            <span className='text-[22px] font-bold text-white my-2 text-center'>Player 1 turn</span>
            <Image src='/dice-bg.png' alt='dice-bg' width={164} height={164} />
        </div>
        <div className='flex flex-col justify-center items-center'>
            <span className='text-[14px] rounded-[10px] font-extrabold w-[337px] text-center h-[37px] flex justify-center items-center text-white bg-[#5B2D0C]'>Battle stake - <span>1000000000</span>$BNK</span>
            <div className='bg-[url("/ability-bg.png")] bg-cover w-[384px] h-[271px] flex justify-center items-center'>
            <div className='h-fit w-[280px] mx-auto'>
              {abilities.map((ability, index) => (
                <span key={index} className='text-primary m-1 inline-flex items-center h-9 px-[10px] w-fit text-[14px] font-bold bg-white rounded-[5px]'>
                  {index + 1}. {ability.name} {ability.type === 'attack' ? `[-${ability.value}]` : ''}
                </span>
              ))}
            </div>
            </div>
        </div>
        <div className='absolute h-vh top-0 w-full'>
        {/* <WonMessage /> */}
        {/* <LostMessage /> */}
        </div>
    </div>
  )
}
