'use client';

import React, { useEffect, useState } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { useToast } from '@/contexts/toast-context';

const DiceRoll: React.FC = () => {
  const { rollAndRecordDice, gameState, performAttack, addDefenseToInventory } =
    useOnlineGameStore();

  const [rollNumber, setRollNumber] = useState(0);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);

  const { addToast } = useToast();

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      setTelegramUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
  }, []);

  const isPlayerTurn = (() => {
    // Check if game is in progress and both players have selected characters
    if (gameState?.gameStatus !== 'inProgress') return false;

    // Check if player1 or player2 ID matches the current user's ID
    const isPlayer1 = gameState.player1?.id === telegramUserId;
    const isPlayer2 = gameState.player2?.id === telegramUserId;

    // Determine if it's this player's turn based on current turn and player role
    if (isPlayer1 && gameState.currentTurn === 'player1') return true;
    if (isPlayer2 && gameState.currentTurn === 'player2') return true;

    return false;
  })();

  const handleRollDice = async () => {
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
              addToast(`Added 1 ${ability.defenseType} to your inventory`);
            } else {
              console.error(
                'Defense type is undefined for the given ability:',
                ability
              );
            }
          } else {
            // For attack abilities
            performAttack(currentPlayer, ability);
            addToast(`${currentPlayer} attacked`, 'info')
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

  return (
    <div className="flex items-center gap-5">
      <button 
        disabled={!isPlayerTurn}
        className="bg-accent text-white py-2 px-4 rounded-xl disabled:bg-accent/70 disabled:text-white"
        onClick={handleRollDice}
      >
        Roll Dice
      </button>
      <p className='text-white text-[18px] font-bold'>{rollNumber}</p>
    </div>
  );
};

export default DiceRoll;
