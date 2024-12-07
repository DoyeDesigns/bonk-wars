'use client';

import React, { useEffect, useState } from 'react';
import useOnlineGameStore from '@/store/online-game-store';

const DiceRoll: React.FC = () => {
  const { rollAndRecordDice, gameState, performAttack, addDefenseToInventory } =
    useOnlineGameStore();

  const [rollNumber, setRollNumber] = useState(0);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);

  useEffect(() => {
    // Only run this on the client-side
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      setTelegramUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
  }, []);

  const handleRollDice = async () => {
    console.log(gameState);
    try {
      const rolledDiceNumber = await rollAndRecordDice();
      const currentPlayer = gameState.currentTurn;
      const player = gameState[currentPlayer];

      if (player?.character) {
        const abilities = player.character.abilities;

        if (rolledDiceNumber > 0 && rolledDiceNumber <= abilities.length) {
          const ability = abilities[rolledDiceNumber - 1];

          // If ability is a defense, add to inventory
          if (ability.type === 'defense') {
            if (ability.defenseType) {
              addDefenseToInventory(currentPlayer, ability.defenseType);
            } else {
              console.error(
                'Defense type is undefined for the given ability:',
                ability
              );
            }
          } else {
            // For attack abilities
            performAttack(currentPlayer, ability);
          }
        }
      } else {
        console.error('Player or player.character is undefined');
      }
      setRollNumber(rolledDiceNumber);
    } catch (error) {
      console.error('Error rolling dice:', error);
    }
  };

  const isPlayerTurn = gameState?.currentTurn === (telegramUserId === gameState?.player1?.id ? 'player1' : 'player2');

  return (
    <div className="flex items-center gap-5">
      <button 
        disabled={!isPlayerTurn}  // Disable the button if it's not the player's turn
        className="bg-teal-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:text-gray-500"
        onClick={handleRollDice}
      >
        Roll Dice
      </button>
      <p>{rollNumber}</p>
    </div>
  );
};

export default DiceRoll;
