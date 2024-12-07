'use client'

import useOnlineGameStore from "@/store/online-game-store";
import React, { useEffect, useState } from "react";

const DiceRollToDetermineFirstTurn = () => {
    const { checkDiceRollsAndSetTurn, rollAndRecordDice, gameState } = useOnlineGameStore();

    const [rollNumber, setRollNumber] = useState<number | null>(null);
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

    console.log(hasPlayerRolled)
  
    const handleRollDice = async () => {
      if (hasPlayerRolled) {
        console.warn('You have already rolled the dice.');
        return;
      }
  
      try {
        const rolledDiceNumber = await rollAndRecordDice();
        setRollNumber(rolledDiceNumber);
        checkDiceRollsAndSetTurn();
      } catch (error) {
        console.error('Error rolling dice:', error);
      }
    };
  
    return (
      <div className="flex items-center gap-5">
        <button
          disabled={hasPlayerRolled} 
          className="bg-teal-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:text-gray-500" 
          onClick={handleRollDice}
          >Roll Dice to determine first player
        </button>
        <p>
        {rollNumber !== null
          ? `You rolled: ${rollNumber}`
          : hasPlayerRolled
          ? `Your roll: ${gameState?.diceRolls?.[telegramUserId!]}`
          : "Roll the dice to start!"}
      </p>
      </div>
    );
  };
  
  export default DiceRollToDetermineFirstTurn;