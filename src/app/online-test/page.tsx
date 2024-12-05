'use client'

import React, { useState, useEffect } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { Ability, CHARACTERS } from '@/lib/characters';

const GameComponent: React.FC = () => {
  const {
    gameState,
    roomId,
    playerTelegramId,
    createOnlineGameRoom,
    joinGameRoom,
    findOpenGameRoom,
    selectCharacters,
    determineFirstPlayer,
    performAttack,
    useDefense,
    addDefenseToInventory,
    skipDefense,
    rollDice
  } = useOnlineGameStore();

  const [localRoomId, setLocalRoomId] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    try {
      const newRoomId = await createOnlineGameRoom();
      setLocalRoomId(newRoomId);
      alert(`Room created: ${newRoomId}`);
    } catch (error) {
      console.error('Error creating room', error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const availableRoomId = await findOpenGameRoom();
      if (availableRoomId) {
        await joinGameRoom(availableRoomId);
        setLocalRoomId(availableRoomId);
        alert(`Joined room: ${availableRoomId}`);
      } else {
        alert('No available rooms');
      }
    } catch (error) {
      console.error('Error joining room', error);
    }
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    selectCharacters(characterId, 'opponent-character-id'); // Replace with actual logic
  };

  const handleStartGame = () => {
    const player1Roll = rollDice();
    const player2Roll = rollDice();
    determineFirstPlayer(player1Roll, player2Roll);
  };

  const handleAttack = (ability: Ability) => {
    performAttack(gameState.currentTurn, ability);
  };

  const handleDefense = (defenseAbility: Ability) => {
    const lastAttack = gameState.lastAttack;
    if (lastAttack) {
      useDefense(
        gameState.currentTurn === 'player1' ? 'player2' : 'player1', 
        defenseAbility, 
        lastAttack.ability.value
      );
    }
  };

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
            onClick={handleJoinRoom} 
            className="bg-yellow-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-yellow-400"
          >
            Join Room
          </button>
        </div>
        {localRoomId && <p className="text-teal-700 mt-4">Current Room: {localRoomId}</p>}
      </div>

      {/* Character Selection */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">Select Your Character</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CHARACTERS.map(character => (
            <button 
              key={character.id}
              onClick={() => handleCharacterSelect(character.id)}
              className={`text-xl font-medium py-2 px-4 rounded-md shadow-md transition transform hover:scale-105 ${selectedCharacter === character.id ? 'bg-teal-400 text-white' : 'bg-pink-200 text-teal-700 hover:bg-teal-300'}`}
            >
              {character.name}
            </button>
          ))}
        </div>
      </div>

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
          <button 
            onClick={handleStartGame} 
            className="bg-teal-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-teal-400"
          >
            Determine First Player
          </button>
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
