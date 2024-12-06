import useOnlineGameStore from "@/store/online-game-store";
import React from "react";



const DiceRoll: React.FC = () => {
    const { rollAndRecordDice, checkDiceRollsAndSetTurn } = useOnlineGameStore();
  
    const handleRollDice = async () => {
      try {
        await rollAndRecordDice();
        await checkDiceRollsAndSetTurn();
      } catch (error) {
        console.error('Error rolling dice:', error);
      }
    };
  
    return (
      <div>
        <button onClick={handleRollDice}>Roll Dice</button>
      </div>
    );
  };
  
  export default DiceRoll;
  
  