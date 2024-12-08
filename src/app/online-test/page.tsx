'use client'

import React, { useCallback, useState, useEffect } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { Ability, CHARACTERS } from '@/lib/characters';
import GameRooms from './GameRooms';
import JoinedRooms from './UserRooms';
import DiceRollToDetermineFirstTurn from '@/components/FirstTurnDiceRoll';
import DiceRoll from '@/components/DiceRoll';
import DefenseModal from '@/components/DefenceModal';
import { useToast } from '@/contexts/toast-context';


interface LastAttackDetails {
  ability: Ability | null;
  attackingPlayer: 'player1' | 'player2' | null | undefined;
}

const GameComponent: React.FC = () => {
  const {
    gameState,
    roomId,
    playerTelegramId,
    createOnlineGameRoom,
    init,
    selectCharacters,
  } = useOnlineGameStore();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [showSkipDefenseButton, setShowSkipDefenseButton] = useState(false);
  const [lastAttackDetails, setLastAttackDetails] = useState<LastAttackDetails>({ability: null, attackingPlayer: null});
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null)

  const { addToast } = useToast()

  const handleCharacterSelection = (characterId: string) => {
    setSelectedCharacterId(characterId);
    console.log(characterId)
  };


  useEffect(() => {
    const unsubscribe = init();
 
    return () => {
      unsubscribe();
    };
  }, [init]);

  // Handle defense modal logic
  useEffect(() => {
    if (
      gameState.gameStatus === 'inProgress' &&
      gameState.lastAttack !== null &&
      gameState.lastAttack?.ability?.type === 'attack'
    ) {
      setLastAttackDetails(gameState.lastAttack);

      if (gameState.winner !== null) {
        setWinner(gameState.winner);
        addToast(`${gameState.winner} has won the game`, 'info');
        return;
      }

      const attackingPlayer = gameState.lastAttack.attackingPlayer;
      const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
      const defenseInventory = gameState[defendingPlayer].defenseInventory;

      const hasDefenses = Object.values(defenseInventory).some((count) => count > 0);

      // Crucial change: Only show modal for the DEFENDING player
      if (hasDefenses && gameState[defendingPlayer].id === playerTelegramId) {
        setShowDefenseModal(true);
        setShowSkipDefenseButton(true);
      } else {
        // If no defenses, automatically skip defense
        handleDefenseSelection(null);
      }
    } else {
      setShowDefenseModal(false);
    }
  }, [gameState, gameState.lastAttack]);

  const handleDefenseSelection = async (defenseType: string | null) => {
    const { ability, attackingPlayer } = lastAttackDetails;
    if (!ability || !attackingPlayer) return;
 
    const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
    const incomingDamage = ability.value;
 
    if (defenseType === null) {
      useOnlineGameStore.getState().skipDefense(defendingPlayer, incomingDamage, ability);
      addToast(`${defendingPlayer} took ${incomingDamage} damage from ${ability.name}`, 'info');
    } else {
      const defenseAbility: Ability = {
        id: `${defendingPlayer}-${defenseType}`,
        name: defenseType,
        defenseType: defenseType as 'dodge' | 'block' | 'reflect',
        value: 0,
        type: 'defense',
        description: '',
      };
 
      const wasDefenseSuccessful = await useOnlineGameStore.getState().useDefense(
        defendingPlayer,
        defenseAbility,
        incomingDamage
      );
 
      if (wasDefenseSuccessful) {
        switch (defenseType) {
          case 'dodge':
            addToast(`${defendingPlayer} dodged the attack`, 'info');
            break;
          case 'block':
            addToast(`${defendingPlayer} blocked the attack`, 'info');
            break;
          case 'reflect':
            addToast(`${defendingPlayer} reflected the attack`, 'info');
            break;
        }
      }
    }
 
    setShowDefenseModal(false);
    setLastAttackDetails({ ability: null, attackingPlayer: null });
};

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
      if (!roomId || !selectedCharacterId) {
        alert('Please create or join a room first');
        return;
      }
  
      try {
        // Call the `selectCharacters` function to update Firestore
        selectCharacters(roomId, characterId);
  
        // Optionally notify the user
        alert(`Character selected: ${CHARACTERS.find((char) => char.id === characterId)?.name}`);
      } catch (error) {
        console.error('Error selecting character', error);
        alert(`Error selecting character: ${error}`);
      }
    },
    [roomId, selectCharacters, selectedCharacterId]
  );

  return (
    <div className="bg-gradient-to-r from-pink-200 via-yellow-200 to-teal-200 h-full overflow-auto p-8 font-sans pb-[200px]">
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
          onClick={() => handleCharacterSubmit()}
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

        <button onClick={() => init()} className="bg-teal-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:text-gray-500">Initialize game state</button>
      </div>

      {/* Game Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="mb-4">
          <DiceRollToDetermineFirstTurn />
          <DiceRoll />
        </div>

      </div>
      {showDefenseModal && (
        <DefenseModal
          player={lastAttackDetails.attackingPlayer === 'player1' ? 'player2' : 'player1'}
          onClose={() => {
            setShowDefenseModal(false);
            setShowSkipDefenseButton(false);
          }}
          onDefenseSelect={handleDefenseSelection}
          showSkipButton={showSkipDefenseButton} 
        />
      )}
      {
        winner !== null && (<div className='absolute w-[200px] h-10 top-0 left-0'>{winner} has won the game</div>)
      }
    </div>
  );
};

export default GameComponent;

