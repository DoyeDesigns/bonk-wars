'use client'

import useOnlineGameStore from "@/store/online-game-store";
import React, { useState } from "react";



const DiceRoll: React.FC = () => {
    const { rollAndRecordDice } = useOnlineGameStore();

    const [rollNumber, setRollNumber] = useState(0);
  
    const handleRollDice = async () => {
      try {
        const rolledDiceNumber = await rollAndRecordDice();
        setRollNumber(rolledDiceNumber);
      } catch (error) {
        console.error('Error rolling dice:', error);
      }
    };
  
    return (
      <div className="flex items-center gap-5 ">
        <button className="bg-teal-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:text-gray-500" onClick={handleRollDice}>Roll Dice</button>
        <p>{rollNumber}</p>
      </div>
    );
  };
  
  export default DiceRoll;
  
  