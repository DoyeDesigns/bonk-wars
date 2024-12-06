'use client'

import React, { useCallback, useState, useEffect } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { Ability, CHARACTERS } from '@/lib/characters';
import GameRooms from './GameRooms';
import JoinedRooms from './UserRooms';
import DiceRollToDetermineFirstTurn from '@/components/FirstTurnDiceRoll';
import DiceRoll from '@/components/DiceRoll';

const GameComponent: React.FC = () => {
  const {
    gameState,
    roomId,
    createOnlineGameRoom,
    init,
    selectCharacters,
    performAttack,
  } = useOnlineGameStore();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const handleCharacterSelection = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };


  useEffect(() => {
    const unsubscribe = init();
 
    return () => {
      unsubscribe();
    };
  }, [init]);

  const handleCreateRoom = async () => {
    try {
      const newRoomId = await createOnlineGameRoom();
      alert(`Room created: ${newRoomId}`);
    } catch (error) {
      console.error('Error creating room', error);
    }
  };

  const handleCharacterSubmit = () => {
    handleCharacterSelect(selectedCharacterId as string);
  }

  const handleCharacterSelect = useCallback(
    async (characterId: string) => {
      // Ensure a room exists
      if (!roomId || selectedCharacterId) {
        alert('Please create or join a room first');
        return;
      }
  
      try {
        // Call the `selectCharacters` function to update Firestore
        await selectCharacters(roomId, characterId);
  
        // Optionally notify the user
        alert(`Character selected: ${CHARACTERS.find((char) => char.id === characterId)?.name}`);
      } catch (error) {
        console.error('Error selecting character', error);
        alert(`Error selecting character: ${error}`);
      }
    },
    [roomId, selectCharacters, selectedCharacterId]
  );

  const handleAttack = (ability: Ability) => {
    performAttack(gameState.currentTurn, ability);
  };

  const handleDefense = useCallback((defenseAbility: Ability) => {
    const lastAttack = gameState.lastAttack;
    if (lastAttack) {
      // Directly use useDefense from the store
      useOnlineGameStore.getState().useDefense(
        gameState.currentTurn === 'player1' ? 'player2' : 'player1', 
        defenseAbility, 
        lastAttack.ability.value
      );
    }
  }, [gameState]);

  return (
    <div className="bg-gradient-to-r from-pink-200 via-yellow-200 to-teal-200 h-full overflow-auto p-8 font-sans pb-[500px]">
      <h1 className="text-4xl font-bold text-center text-teal-800 mb-8">Online Battle Game</h1>

      {/* Room Management */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">Room Management</h2>
        <div className="space-x-4">
          <button 
            onClick={handleCreateRoom} 
            className="bg-pink-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-pink-400"
          >
            Create Room
          </button>
          <button 
            // onClick={handleJoinRoom} 
            className="bg-yellow-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-yellow-400"
          >
            Join Room
          </button>
        </div>
        {roomId && <p className="text-teal-700 mt-4">Current Room: {roomId}</p>}
      </div>

      {/* Character Selection */}
      <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CHARACTERS.map((character) => (
          <button
            key={character.id}
            onClick={() => handleCharacterSelection(character.id)}
            className={`
              text-xl font-medium py-2 px-4 rounded-md shadow-md transition transform hover:scale-105
              ${selectedCharacterId === character.id
                ? 'bg-teal-400 text-white' // Highlight selected character
                : 'bg-pink-200 text-teal-700 hover:bg-teal-300'
              }
            `}
          >
            {character.name}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <button
          onClick={() => handleCharacterSubmit}
          disabled={!selectedCharacterId} // Disable if no character selected
          className="bg-teal-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:text-gray-500"
        >
          Submit Selection
        </button>
      </div>
    </div>

      <GameRooms />
      <JoinedRooms />

      {/* Game State Display */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">Game Status</h2>
        <p className="text-teal-700">Status: {gameState.gameStatus}</p>
        <p className="text-teal-700">Current Turn: {gameState.currentTurn}</p>

        {/* Player Info */}
        <div className="mt-4">
          <h3 className="font-semibold text-teal-700">Player 1</h3>
          <p className="text-teal-700">Character: {gameState?.player1?.character?.name}</p>
          <p className="text-teal-700">Health: {gameState?.player1?.currentHealth}</p>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-teal-700">Player 2</h3>
          <p className="text-teal-700">Character: {gameState?.player2?.character?.name}</p>
          <p className="text-teal-700">Health: {gameState?.player2?.currentHealth}</p>
        </div>
      </div>

      {/* Game Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="mb-4">
          <DiceRollToDetermineFirstTurn />
          <DiceRoll />
        </div>

        {/* Attack Buttons */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-teal-700">Attacks</h3>
          <div className="space-x-4 space-y-2">
            {gameState?.player1?.character?.abilities.map(ability => (
              <button 
                key={ability.name}
                onClick={() => handleAttack(ability)}
                disabled={gameState.currentTurn !== 'player1'}
                className="bg-pink-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-400"
              >
                {ability.name}
              </button>
            ))}
          </div>
        </div>

        {/* Defense Buttons */}
        <div>
          <h3 className="text-xl font-semibold text-teal-700">Defenses</h3>
          <div className="space-x-4">
            <button 
              onClick={() => handleDefense({ defenseType: 'dodge' } as Ability)}
              disabled={gameState.currentTurn !== 'player2'}
              className="bg-yellow-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-400"
            >
              Dodge
            </button>
            <button 
              onClick={() => handleDefense({ defenseType: 'block' } as Ability)}
              disabled={gameState.currentTurn !== 'player2'}
              className="bg-teal-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-400"
            >
              Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
