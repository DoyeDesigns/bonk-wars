'use client'

import React, { useState, useEffect, useCallback } from 'react';
import useGameStore from '@/store/game-store';
import DefenseModal from '@/components/DefenceModal';
import { CHARACTERS, Ability } from '@/lib/characters';
import Toast from '@/components/Toast';

interface LastAttackDetails {
  ability: Ability | null;
  attackingPlayer: 'player1' | 'player2' | null;
}


const FightingGame = () => {
  const {
    gameState,
    rollDice,
    selectCharacters,
    determineFirstPlayer,
    performAttack,
    // useDefense,
    // skipDefense,
    addDefenseToInventory,
  } = useGameStore();

  const [player1Roll, setPlayer1Roll] = useState<number | null>(null);
  const [player2Roll, setPlayer2Roll] = useState<number | null>(null);
  const [showSkipDefenseButton, setShowSkipDefenseButton] = useState(false);
  const [lastAttackDetails, setLastAttackDetails] = useState<LastAttackDetails>({ ability: null, attackingPlayer: null });
  const [selectedCharacters, setSelectedCharacters] = useState<{
    player1: string | null;
    player2: string | null;
  }>({ player1: null, player2: null });
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDefenseModal, setShowDefenseModal] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Handle defense modal logic
  useEffect(() => {
    if (
      gameState.gameStatus === 'inProgress' &&
      lastAttackDetails !== null &&
      lastAttackDetails?.ability?.type === 'attack'
    ) {
      const attackingPlayer = lastAttackDetails.attackingPlayer;
      const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
      const defenseInventory = gameState[defendingPlayer].defenseInventory;

      const hasDefenses = Object.values(defenseInventory).some((count) => count > 0);

      // Crucial change: Only show modal for the DEFENDING player
      if (hasDefenses) {
        setShowDefenseModal(true);
        setShowSkipDefenseButton(true);
      } else {
        // If no defenses, automatically skip defense
        handleDefenseSelection(null);
      }
    } else {
      setShowDefenseModal(false);
    }
  }, [gameState, lastAttackDetails]);

  const handleCharacterSelect = (player: 'player1' | 'player2', characterId: string) => {
    setSelectedCharacters((prev) => ({ ...prev, [player]: characterId }));
    showToast(`${player === 'player1' ? 'Player 1' : 'Player 2'} selected ${characterId}`);
  };

  const startGame = () => {
    if (selectedCharacters.player1 && selectedCharacters.player2) {
      selectCharacters(selectedCharacters.player1, selectedCharacters.player2);
      showToast('Game started!');
    }
  };

  const handleRollDiceForStart = () => {
    const roll1 = rollDice();
    const roll2 = rollDice();

    setPlayer1Roll(roll1);
    setPlayer2Roll(roll2);

    determineFirstPlayer(roll1, roll2);
    showToast(`Player 1 rolled ${roll1}, Player 2 rolled ${roll2}`);
  };

  const handleDiceRoll = () => {
    const roll = rollDice();
    setDiceRoll(roll);

    const currentPlayer = gameState.currentTurn;
    const player = gameState[currentPlayer];
    const abilities = player.character.abilities;

    if (roll > 0 && roll <= abilities.length) {
      const ability = abilities[roll - 1];

      // If ability is a defense, add to inventory (skip toast notification)
      if (ability.type === 'defense') {
        if (ability.defenseType) {
          addDefenseToInventory(currentPlayer, ability.defenseType);
          // Skip showing toast for defense gain
        } else {
          console.error('Defense type is undefined for the given ability:', ability);
        }
      } else {
        // For attack abilities
        performAttack(currentPlayer, ability);
        setLastAttackDetails({ ability, attackingPlayer: currentPlayer });
        showToast(`${player.character.name} used ${ability.name}`);
      }
    }
  };

  // Now handleDefenseSelection should not call useDefense directly
  const handleDefenseSelection = useCallback((defenseType: string | null) => {
    const { ability, attackingPlayer } = lastAttackDetails;
    if (!ability || !attackingPlayer) return;
  
    const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
    const incomingDamage = ability.value;
  
    if (defenseType === null) {
      // Directly use the store method for skipping defense
      useGameStore.getState().skipDefense(defendingPlayer, incomingDamage, ability);
      showToast(`${defendingPlayer} took ${incomingDamage} damage from ${ability.name}`);
    } else {
      const defenseAbility: Ability = {
        id: `${defendingPlayer}-${defenseType}`,
        name: defenseType,
        defenseType: defenseType as 'dodge' | 'block' | 'reflect',
        value: 0,
        type: 'defense',
        description: '',
      };
      
      // Use getState() to directly access store methods
      const wasDefenseSuccessful = useGameStore.getState().useDefense(
        defendingPlayer, 
        defenseAbility, 
        incomingDamage
      );
      
      if (wasDefenseSuccessful) {
        switch (defenseType) {
          case 'dodge':
            showToast(`${defendingPlayer} dodged the attack`);
            break;
          case 'block':
            showToast(`${defendingPlayer} blocked the attack`);
            break;
          case 'reflect':
            showToast(`${defendingPlayer} reflected the attack`);
            break;
        }
      }
    }
    
    setShowDefenseModal(false);
    setLastAttackDetails({ ability: null, attackingPlayer: null });
  }, [lastAttackDetails, showToast, setShowDefenseModal, setLastAttackDetails]);

  const renderPlayerActions = (playerKey: 'player1' | 'player2') => {
    const player = gameState[playerKey];
    const isCurrentTurn = gameState.currentTurn === playerKey;

    return (
      <div className={`flex-1 h-[500px] p-4 overflow-auto ${isCurrentTurn ? 'bg-yellow-100' : ''}`}>
        <h2 className="text-xl font-bold">{player.character.name}</h2>
        <p>Health: {player.currentHealth}</p>

        {player.skippedDefense && (
          <div className="mt-4 bg-red-100 p-3 rounded">
            <h3 className="font-semibold text-red-700">Damage Recieved</h3>
            <p>Actual Damage: -{player.skippedDefense.damage}</p>
            <p>From Ability: {player.skippedDefense.ability.name}</p>
          </div>
        )}

        {/* Defense Inventory */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Defense Inventory:</h3>
          <div className="flex space-x-2">
            {Object.entries(player.defenseInventory).map(([defenseType, count]) => (
              <div
                key={defenseType}
                className="bg-green-100 px-3 py-1 rounded-full flex items-center"
              >
                <span className="capitalize mr-2">{defenseType}</span>
                <span className="bg-green-300 text-green-800 px-2 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Abilities:</h3>
          <button
            onClick={handleDiceRoll}
            className={`mr-2 mb-2 px-4 py-2 rounded ${
              isCurrentTurn
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isCurrentTurn}
          >
            Roll Dice (1-6)
          </button>
          {diceRoll && (
            <p className="mt-2">
              Dice Roll: {diceRoll} - Ability Used: {player.character.abilities[diceRoll - 1]?.name}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-lg full overflow-auto mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Fighting Game</h1>

      {gameState.gameStatus === 'character-select' && (
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-center">Select Characters</h2>
          <div className="grid grid-cols-2 gap-4">
            {CHARACTERS.map((character) => (
              <div
                key={character.id}
                className="border p-4 rounded-lg cursor-pointer hover:bg-gray-200"
                onClick={() => handleCharacterSelect(
                  selectedCharacters.player1 ? 'player2' : 'player1',
                  character.id
                )}
              >
                <h3 className="text-lg font-semibold">{character.name}</h3>
                <p>{character.specialty}</p>
              </div>
            ))}
          </div>
          {selectedCharacters.player1 && selectedCharacters.player2 && (
            <button
              onClick={startGame}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {gameState.gameStatus === 'waiting' && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Roll Dice to Determine First Player</h2>
          <button
            onClick={handleRollDiceForStart}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Roll Dice
          </button>
          {player1Roll !== null && player2Roll !== null && (
            <p className="mt-4">
              Player 1: {player1Roll} | Player 2: {player2Roll}
            </p>
          )}
        </div>
      )}

      {gameState.gameStatus === 'inProgress' && (
        <div className="flex justify-between space-x-4">
          {renderPlayerActions('player1')}
          {renderPlayerActions('player2')}
        </div>
      )}

      {gameState.gameStatus === 'finished' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl mb-4">
            {gameState.currentTurn === 'player1'
              ? gameState.player2.character.name
              : gameState.player1.character.name}{' '}
            wins!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Defense Modal */}
      {showDefenseModal && (
        <DefenseModal
          player={lastAttackDetails.attackingPlayer === 'player1' ? 'player2' : 'player1'}
          onClose={() => {
            setShowDefenseModal(false);
            setShowSkipDefenseButton(false);
          }}
          onDefenseSelect={handleDefenseSelection}
          showSkipButton={showSkipDefenseButton} // Pass this prop to the modal
        />
      )}

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default FightingGame;
