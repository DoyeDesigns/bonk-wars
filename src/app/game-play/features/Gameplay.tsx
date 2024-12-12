'use client'

import React, { useState, useEffect } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { Ability } from '@/lib/characters';
import DiceRollToDetermineFirstTurn from '@/components/FirstTurnDiceRoll';
import DiceRoll from '@/components/DiceRoll';
import DefenseModal from '@/components/DefenceModal';
import { useToast } from '@/contexts/toast-context';
import PlayerHealth, { OpponentPlayerHealth } from "./PlayerHealth";
import PlayerAbility from './PlayerAbility';
import WonMessage from './WonMessage'
import LostMessage from './LostMessage'

interface LastAttackDetails {
  ability: Ability | null;
  attackingPlayer: 'player1' | 'player2' | null | undefined;
}


export default function Gameplay({roomId} : {roomId: string}) {
  const {
    gameState,
    init,
  } = useOnlineGameStore();

  console.log('Main game State:', gameState)

  const [showSkipDefenseButton, setShowSkipDefenseButton] = useState(false);
  const [lastAttackDetails, setLastAttackDetails] = useState<LastAttackDetails>({ability: null, attackingPlayer: null});
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [defendingPlayer, setDefendingPlayer] = useState('');
  const [currentUserTelegramId, setCurrentUserTelegramId] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [showLoser, setShowLoser] = useState(false);


  const { addToast } = useToast();

  const gameRoomId = roomId;

  useEffect(() => {
    const unsubscribe = init(gameRoomId);
 
    return () => {
      unsubscribe();
    };
  }, [gameRoomId, init]);

  useEffect(() =>
  {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (telegramUser?.id) {
        setCurrentUserTelegramId(telegramUser.id);
      }
  }, [currentUserTelegramId])

  // Handle defense modal logic
  useEffect(() => {
    if (
      gameState.gameStatus === 'inProgress' &&
      gameState.lastAttack !== null &&
      gameState.lastAttack?.ability?.type === 'attack' &&
      gameState.lastAttack?.attackingPlayer
    ) {

      setLastAttackDetails(gameState.lastAttack);
      setShowDefenseModal(false);
      setShowSkipDefenseButton(false);
    
      if (gameState.winner === 'player1' || gameState.winner === 'player2') {
        addToast(`${gameState.winner} has won the game`, 'success');
        if (currentUserTelegramId === gameState[gameState?.winner]?.id) {
          setShowWinner(true); 
        } else {
          setShowLoser(true);
        }
        return;
      }
      
      const attackingPlayer = gameState.lastAttack.attackingPlayer;
      const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';

      if (currentUserTelegramId === gameState[defendingPlayer]?.id) {
        const defenseInventory = gameState[defendingPlayer]?.defenseInventory || {};
        const hasDefenses = Object.values(defenseInventory).some((count) => count > 0);
  
        if (hasDefenses) {
          setDefendingPlayer(defendingPlayer);
          setShowDefenseModal(true);
          setShowSkipDefenseButton(true);
        } else {
          // Automatically skip defense if no defenses are available
          useOnlineGameStore.getState().skipDefense(defendingPlayer, gameState.lastAttack.ability.value, gameState.lastAttack.ability);
          addToast(`You took -${gameState.lastAttack.ability.value} damage`, 'error')
        }
      }
    } else {
      setShowDefenseModal(false);
    }
  }, [gameState.lastAttack, gameState.winner]);

  const handleDefenseSelection = async (defenseType: string | null) => {
    const { ability, attackingPlayer } = lastAttackDetails;
    if (!ability || !attackingPlayer) return;
 
    const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
    const incomingDamage = ability.value;
 
    if (defenseType === null) {
      useOnlineGameStore.getState().skipDefense(defendingPlayer, incomingDamage, ability);
      addToast(`${defendingPlayer} took -${incomingDamage} damage from ${ability.name}`, 'error');
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
            addToast(`${defendingPlayer} dodged the attack`, 'success');
            break;
          case 'block':
            addToast(`${defendingPlayer} blocked the attack`, 'success');
            break;
          case 'reflect':
            addToast(`${defendingPlayer} reflected the attack`, 'success');
            break;
        }
      }
    }
 
    setShowDefenseModal(false);
    setLastAttackDetails({ ability: null, attackingPlayer: null });
};

  return (
    <div className='bg-[url("/game-play-bg.png")] bg-cover bg-no-repeat h-full overflow-auto  pt-[15px] relative'>
      <div className="flex flex-col gap-5 px-5">
        <div>
          <PlayerHealth  gameState={gameState}  userId={currentUserTelegramId}/>
        </div>
        <div className="flex justify-end">
          <OpponentPlayerHealth gameState={gameState}  userId={currentUserTelegramId}/>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-10 mb-5">
        <span className="text-[22px] font-bold text-white my-2 text-center">
          {gameState.currentTurn === 'player1' ? 'Player 1 turn' : 'Player 2 turn'}
        </span>
        {/* <Image src="/dice-bg.png" alt="dice-bg" width={164} height={164} /> */}
        <div className='bg-[url("/dice-bg.png")] bg-cover flex flex-col justify-center items-center h-[164px] w-[164px] gap-3'>
        </div>
        <div className='space-y-3 flex flex-col justify-center items-center mt-2'>
          <DiceRoll />
          <DiceRollToDetermineFirstTurn />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <span className="text-[14px] rounded-[10px] font-extrabold w-[337px] text-center h-[37px] flex justify-center items-center text-white bg-[#5B2D0C]">
          Battle stake - <span>1000000000</span>$BNK
        </span>
        <div className='bg-[url("/ability-bg.png")] bg-cover w-[384px] h-[271px] flex justify-center items-center'>
          <PlayerAbility gameState={gameState} userId={currentUserTelegramId} />
        </div>
      </div>
      <div className="absolute h-vh top-0 w-full">
        {showWinner && <WonMessage />}
        {showLoser && <LostMessage />}
        {showDefenseModal && defendingPlayer === gameState.currentTurn && (
        <DefenseModal
          player={defendingPlayer as 'player1' | 'player2'}
          onClose={() => setShowDefenseModal(false)}
          onDefenseSelect={handleDefenseSelection}
          showSkipButton={showSkipDefenseButton}
        />
      )}
      </div>
    </div>
  );
}
