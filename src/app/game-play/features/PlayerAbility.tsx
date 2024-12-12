import React from 'react'
import { GameRoomDocument } from '@/store/online-game-store';
import { CHARACTERS } from '@/lib/characters';

export default function PlayerAbility({ gameState, userId }: {
  gameState?: GameRoomDocument['gameState'],
  userId: number | null
}) {
  // Always show the current user's information
  const isPlayer1 = gameState?.player1.id === userId;
  const isPlayer2 = gameState?.player2.id === userId;

  const currentPlayer = isPlayer1 
    ? gameState.player1 
    : isPlayer2 
      ? gameState.player2 
      : null;

    console.log('Current player ability', currentPlayer?.character)

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