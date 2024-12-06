import useOnlineGameStore from "@/store/online-game-store";
import React from "react";

const DiceRollToDetermineFirstTurn = () => {
    const { rollAndRecordDice, checkDiceRollsAndSetTurn } = useOnlineGameStore();
  
    const handleRollDice = async () => {
      try {
        await rollAndRecordDice();
        checkDiceRollsAndSetTurn();
      } catch (error) {
        console.error('Error rolling dice:', error);
      }
    };
  
    return (
      <div>
        <button onClick={handleRollDice}>Roll Dice to determine first player</button>
      </div>
    );
  };
  
  export default DiceRollToDetermineFirstTurn;