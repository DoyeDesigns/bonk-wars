import { create } from 'zustand';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CHARACTERS, Character, Ability } from '@/lib/characters';
import { Timestamp } from 'firebase/firestore';

// Define the structure of a player in the game room
interface GameRoomPlayer {
  telegramId: number;
  username?: string;
  characterId: string | null;
  role: 'creator' | 'challenger';
}

// Define the structure of the game room document
interface GameRoomDocument {
  id: string;
  createdBy: number;
  status: 'waiting' | 'character-select' | 'inProgress' | 'finished';
  players: {
    [telegramId: number]: GameRoomPlayer;
  };
  createdAt: Timestamp;
  gameState?: GameState; // Assuming GameState is defined in your existing types
}

// Recreate the GameState interface from the original file
interface DefenseInventory {
  [defenseType: string]: number;
}

interface GameState {
  player1: {
    character?: Character;
    currentHealth: number;
    defenseInventory: DefenseInventory;
    skippedDefense?: {
      ability: Ability;
      damage: number;
    };
  };
  player2: {
    character?: Character;
    currentHealth: number;
    defenseInventory: DefenseInventory;
    skippedDefense?: {
      ability: Ability;
      damage: number;
    };
  };
  currentTurn: 'player1' | 'player2';
  gameStatus: 'waiting' | 'character-select' | 'inProgress' | 'finished';
  lastAttack?: {
    ability: Ability;
    attackingPlayer: 'player1' | 'player2';
  };
}

// Online Game Store interface
interface OnlineGameStore {
  roomId: string | null;
  playerTelegramId: number | null;
  gameState: GameState;
  rollDice: () => number;
  selectCharacters: (player1CharId: string, player2CharId: string) => void;
  determineFirstPlayer: (player1Roll: number, player2Roll: number) => void;
  performAttack: (attackingPlayer: 'player1' | 'player2', ability: Ability) => void;
  useDefense: (
    defendingPlayer: 'player1' | 'player2',
    defenseAbility: Ability,
    incomingDamage: number
  ) => boolean;
  addDefenseToInventory: (player: 'player1' | 'player2', defenseType: string) => void;
  skipDefense: (
    defendingPlayer: 'player1' | 'player2', 
    incomingDamage: number, 
    ability: Ability
  ) => void;
  createOnlineGameRoom: () => Promise<string>;
  joinGameRoom: (roomId: string) => Promise<void>;
  findOpenGameRoom: () => Promise<string | null>;
  leaveGameRoom: () => Promise<void>;
  init: () => void;
}


const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
  roomId: null,
  playerTelegramId: null,
  gameState: {
    player1: {
      character: CHARACTERS[0],
      currentHealth: CHARACTERS[0].baseHealth,
      defenseInventory: {},
    },
    player2: {
      character: CHARACTERS[1],
      currentHealth: CHARACTERS[1].baseHealth,
      defenseInventory: {},
    },
    currentTurn: 'player1',
    gameStatus: 'character-select',
  },

  rollDice: () => Math.floor(Math.random() * 6) + 1,

  selectCharacters: (player1CharId, player2CharId) => {
    const player1Character = CHARACTERS.find((char) => char.id === player1CharId);
    const player2Character = CHARACTERS.find((char) => char.id === player2CharId);

    if (player1Character && player2Character) {
      set((state) => ({
        gameState: {
          ...state.gameState,
          player1: {
            character: player1Character,
            currentHealth: player1Character.baseHealth,
            defenseInventory: {},
          },
          player2: {
            character: player2Character,
            currentHealth: player2Character.baseHealth,
            defenseInventory: {},
          },
          gameStatus: 'waiting',
        },
      }));
    }
  },

  determineFirstPlayer: (player1Roll, player2Roll) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        currentTurn: player1Roll > player2Roll ? 'player1' : 'player2',
        gameStatus: 'inProgress',
      },
    }));
  },

  // ... (rest of the methods from the original game store)
  // Copy all methods from the original useGameStore implementation

  addDefenseToInventory: (player, defenseType) => {
    set((state) => {
      const currentInventory = state.gameState[player].defenseInventory;
      const updatedInventory = {
        ...currentInventory,
        [defenseType]: (currentInventory[defenseType] || 0) + 1,
      };

      // Switch turn when adding a defense
      const nextPlayer = player === 'player1' ? 'player2' : 'player1';

      return {
        gameState: {
          ...state.gameState,
          [player]: {
            ...state.gameState[player],
            defenseInventory: updatedInventory,
          },
          currentTurn: nextPlayer,
        },
      };
    });
  },

  skipDefense: (defendingPlayer, incomingDamage, ability) => {
  set((state) => {
    const newState = { ...state.gameState };
    // const opponentPlayer = defendingPlayer === 'player1' ? 'player2' : 'player1';

    // Apply damage to the player
    newState[defendingPlayer].currentHealth -= incomingDamage;

    // Store the skipped defense details for potential later use
    newState[defendingPlayer].skippedDefense = {
      ability,
      damage: incomingDamage
    };

    // Important: Keep the current turn with the defending player
    // This allows the defender to roll dice and attack after taking damage
    newState.currentTurn = defendingPlayer;

    // Check if game is over
    if (newState[defendingPlayer].currentHealth <= 0) {
      newState.gameStatus = 'finished';
    }

    return { gameState: newState };
  });
},

  // Modify the useDefense method to clear skippedDefense when a defense is used
  useDefense: (defendingPlayer, defenseAbility, incomingDamage) => {
    const opponentPlayer = defendingPlayer === 'player1' ? 'player2' : 'player1';
    const gameState = get().gameState;
  
    if (!defenseAbility?.defenseType) {
      console.error('Invalid defense ability provided');
      return false;
    }
  
    const defenseType = defenseAbility.defenseType;
  
    // Check if defense is available in inventory
    if ((gameState[defendingPlayer].defenseInventory[defenseType] || 0) <= 0) {
      return false;
    }
  
    set((state) => {
      const newState = { ...state.gameState };
  
      // Reduce defense count in inventory
      newState[defendingPlayer].defenseInventory[defenseType]--;

      // Clear any previously skipped defense
      delete newState[defendingPlayer].skippedDefense;
  
      switch (defenseType) {
        case 'dodge':
          // Keep the current turn with the defending player for dodge
          // No damage is taken
          break;
  
        case 'reflect':
          // Reverse the damage back to the opponent
          newState[opponentPlayer].currentHealth -= incomingDamage;
          // Switch turns for reflect
          newState.currentTurn = opponentPlayer;
          break;
  
        case 'block':
          // Block reduces the incoming damage
          newState[defendingPlayer].currentHealth -= Math.max(0, incomingDamage - 25);
          // Switch turns for block
          newState.currentTurn = opponentPlayer;
          break;
  
        default:
          console.error('Unknown defense type');
          break;
      }
  
      // Check if game is over
      if (newState[opponentPlayer].currentHealth <= 0 || newState[defendingPlayer].currentHealth <= 0) {
        newState.gameStatus = 'finished';
      }
  
      return { gameState: newState };
    });
  
    return true;
  },

  // Modify performAttack to track last attack details
  performAttack: (attackingPlayer, ability) => {
    const opponentKey = attackingPlayer === 'player1' ? 'player2' : 'player1';
    // const gameState = get().gameState;
  
    set((state) => {
      const newState = { ...state.gameState };
  
      // REMOVE health subtraction
      // newState[opponentKey].currentHealth -= ability.value;
  
      // Switch turns
      newState.currentTurn = opponentKey;
  
      // Store last attack details for defense modal
      newState.lastAttack = { ability, attackingPlayer };
  
      return { gameState: newState };
    });
  },

  createOnlineGameRoom: async () => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser) {
      throw new Error('Telegram user not found');
    }

    const roomRef = doc(collection(db, 'gameRooms'));
    const roomId = roomRef.id;

    await setDoc(roomRef, {
      id: roomId,
      createdBy: telegramUser.id,
      status: 'waiting',
      players: {
        [telegramUser.id]: {
          telegramId: telegramUser.id,
          username: telegramUser.username,
          characterId: null,
          role: 'creator'
        }
      },
      createdAt: serverTimestamp(),
      gameState: null
    });

    set({ 
      roomId, 
      playerTelegramId: telegramUser.id 
    });

    return roomId;
  },

  joinGameRoom: async (roomId) => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser) {
      throw new Error('Telegram user not found');
    }

    const roomRef = doc(db, 'gameRooms', roomId);
    
    await updateDoc(roomRef, {
      [`players.${telegramUser.id}`]: {
        telegramId: telegramUser.id,
        username: telegramUser.username,
        characterId: null,
        role: 'challenger'
      },
      status: 'character-select'
    });

    set({ 
      roomId, 
      playerTelegramId: telegramUser.id 
    });
  },

  findOpenGameRoom: async () => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser) {
      throw new Error('Telegram user not found');
    }

    const roomsRef = collection(db, 'gameRooms');
    const q = query(
      roomsRef, 
      where('status', '==', 'waiting'),
      where('createdBy', '!=', telegramUser.id)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const roomDoc = querySnapshot.docs[0];
    return roomDoc.id;
  },

  leaveGameRoom: async () => {
    const { roomId, playerTelegramId } = get();
    if (!roomId || !playerTelegramId) {
      return;
    }

    const roomRef = doc(db, 'gameRooms', roomId);
    
    await updateDoc(roomRef, {
      [`players.${playerTelegramId}`]: null,
      status: 'waiting'
    });

    set({ 
      roomId: null, 
      playerTelegramId: null 
    });

    // Reset game state
    set(() => ({
      gameState: {
        player1: {
          character: CHARACTERS[0],
          currentHealth: CHARACTERS[0].baseHealth,
          defenseInventory: {},
        },
        player2: {
          character: CHARACTERS[1],
          currentHealth: CHARACTERS[1].baseHealth,
          defenseInventory: {},
        },
        currentTurn: 'player1',
        gameStatus: 'character-select',
      }
    }));
  },

  init: () => {
    const { roomId, playerTelegramId } = get();
    if (!roomId || !playerTelegramId) {
      return;
    }
  
    const roomRef = doc(db, 'gameRooms', roomId);
    
    return onSnapshot(roomRef, (snapshot) => {
      const roomData = snapshot.data() as GameRoomDocument;
      
      if (!roomData) return;

        const player1 = Object.values(roomData.players)[0];
        const player2 = Object.values(roomData.players)[1];
  
      // Update local game state based on remote state
      set((state) => ({
        gameState: {
          ...state.gameState,
          // Update players based on room data
          player1: {
            ...state.gameState.player1,
            character: player1
            ? CHARACTERS.find(c => c.id === player1.characterId)
            : state.gameState.player1.character,
            currentHealth: roomData.gameState?.player1?.currentHealth ?? state.gameState.player1.currentHealth
          },
          player2: {
            ...state.gameState.player2,
            character: player2
              ? CHARACTERS.find(c => c.id === player2.characterId)
              : state.gameState.player2.character,
            currentHealth: roomData.gameState?.player2?.currentHealth ?? state.gameState.player2.currentHealth
          },
          // Update game status and other relevant state
          currentTurn: roomData.gameState?.currentTurn ?? state.gameState.currentTurn,
          gameStatus: roomData.status || state.gameState.gameStatus,
          lastAttack: roomData.gameState?.lastAttack ?? state.gameState.lastAttack
        }
      }));
    });
  },
}));

export default useOnlineGameStore;