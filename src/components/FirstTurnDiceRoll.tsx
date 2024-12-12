'use client'

import useOnlineGameStore from "@/store/online-game-store";
import React, { useEffect, useState } from "react";

const DiceRollToDetermineFirstTurn = () => {
    const { checkDiceRollsAndSetTurn, rollAndRecordDice, gameState } = useOnlineGameStore();

    const [telegramUserId, setTelegramUserId] = useState<number | null>(null);

    useEffect(() => {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        setTelegramUserId(window.Telegram.WebApp.initDataUnsafe.user.id);
      }
    }, []);
  
    const hasPlayerRolled = (() => {
      if (gameState?.diceRolls && telegramUserId !== null) {
        return telegramUserId in gameState.diceRolls;
      }
      return false;
    })();
  
    const handleRollDice = async () => {
      if (hasPlayerRolled) {
        console.warn('You have already rolled the dice.');
        return;
      }
  
      try {
        rollAndRecordDice();
        checkDiceRollsAndSetTurn();
      } catch (error) {
        console.error('Error rolling dice:', error);
      }
    };
  
    return (
      <div className={`flex items-center gap-5 ${hasPlayerRolled ? 'hidden' : ''}`}>
        <button
          disabled={hasPlayerRolled} 
          className="bg-accent text-white py-2 px-4 rounded-xl disabled:bg-accent/70 disabled:text-white" 
          onClick={handleRollDice}
          >Roll Dice to determine first player
        </button>
        <p>{gameState?.diceRolls?.[telegramUserId!]}</p>
      </div>
    );
  };
  
  export default DiceRollToDetermineFirstTurn;