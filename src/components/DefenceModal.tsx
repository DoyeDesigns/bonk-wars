'use client'
import React from 'react';
import useOnlineGameStore from '@/store/online-game-store'; 

interface DefenseModalProps {
  player: 'player1' | 'player2';
  onClose: () => void;
  onDefenseSelect: (defenseType: string | null) => void;
  showSkipButton?: boolean;
}

const DefenseModal: React.FC<DefenseModalProps> = ({
  player,
  onClose,
  onDefenseSelect,
  showSkipButton = false,
}) => {
  const gameState = useOnlineGameStore((state) => state.gameState);
  const defenseInventory = gameState[player]?.defenseInventory || {};

  const validDefenseTypes = ['dodge', 'reflect', 'block'] as const;
type ValidDefenseType = typeof validDefenseTypes[number];

const availableDefenses = Object.entries(defenseInventory)
  .filter((entry): entry is [ValidDefenseType, number] => {
    const [defenseType, count] = entry;
    return validDefenseTypes.includes(defenseType as ValidDefenseType) && count > 0;
  });

  const renderDefenseButton = (defenseType: string) => {
    const count = defenseInventory[defenseType] || 0;
    return (
      <button
        key={defenseType}
        onClick={() => onDefenseSelect(defenseType)}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-2 hover:bg-blue-600 disabled:opacity-50"
      >
        {defenseType.charAt(0).toUpperCase() + defenseType.slice(1)}
        <span className="ml-2 bg-blue-600 px-2 rounded-full">{count}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {player === 'player1' ? 'Player 1' : 'Player 2'} Defense Options
        </h2>

        {availableDefenses.length > 0 ? (
          <div className="mb-4">
            {availableDefenses.map(([defenseType]) =>
              renderDefenseButton(defenseType)
            )}
          </div>
        ) : (
          <p className="text-gray-700">No defenses available.</p>
        )}

        {showSkipButton && (
          <button
            onClick={() => onDefenseSelect(null)}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Skip Defense (Take Damage)
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};


export default DefenseModal;