import React from 'react'
import { GameRoomDocument } from '@/store/online-game-store';
import { CHARACTERS } from '@/lib/characters';

export default function PlayerAbility({ gameState, userId }: {
  gameState?: GameRoomDocument['gameState'],
  userId: number | null
}) {
  // Always show the current user's information
  const currentPlayer = gameState?.player1.id === userId 
    ? gameState?.player1 
    : gameState?.player2;

    console.log('player health:', currentPlayer?.character?.id);

    const character = CHARACTERS.find((c) => c.id === currentPlayer?.character?.id);

  return (
    <div className='h-fit pl-2 w-[330px] justify-center items-center'>
      {character?.abilities.map((ability, index) => (
        <span
        key={index}
        className="text-primary m-1 inline-flex items-center h-9 px-[10px] w-fit text-[14px] font-bold bg-white rounded-[5px]"
      >
        {index + 1}. {ability.name}{" "}
        {ability.type === "attack" ? `[-${ability.value}]` : ""}
      </span>
      ))}
    </div>
  )
}