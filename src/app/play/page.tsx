'use client'

import React from 'react'
import Link from 'next/link'
import GameRoomSearch from './features/GameRoomSearch'
import UserGameRooms from './features/UserRooms'

export default function Play() {
  return (
    <div className='h-full overflow-auto bg-background flex flex-col justify-center px-4'>
        <div className='h-full'>
            <h1 className='pb-4 pt-9 font-bold text-white pl-4'>Find Game</h1>
            <GameRoomSearch />
            <div className='flex flex-col items-center gap-4'>
                <Link href='/create-game' className='btn h-12 bg-secondary w-full text-black hover:bg-secondary'>Create Game</Link>
            </div>
            <UserGameRooms />
        </div>
    </div>
  )
}
