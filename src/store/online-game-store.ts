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
  getDocs,
  getDoc
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
  diceRoll?: number
}

// Define the structure of the game room document
export interface GameRoomDocument {
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
  diceRolls?: {
    [key: string]: number;
  };
}

// Online Game Store interface
interface OnlineGameStore {
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  playerTelegramId: number | null;
  gameState: GameState;
  rollAndRecordDice: () => Promise<number>;
  checkDiceRollsAndSetTurn: () => void;
  selectCharacters: (roomId: string, characterId: string) => void;
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
  findUserRooms: () => Promise<GameRoomDocument[] | null>;
  findOpenGameRoom: () => Promise<GameRoomDocument[] | null>;
  leaveGameRoom: () => Promise<void>;
  init: () => () => void;
}


const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
  roomId: null,
  setRoomId: (id: string) => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    //   const telegramUser = {
    //   id: 5532711018,
    //   username: 'doye',
    // };
    if (!telegramUser) return;

    console.log('setting room id');

    set({ 
      roomId: id, 
      playerTelegramId: telegramUser.id 
    });
  },
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

  // In the store, add a method to roll and record dice rolls
rollAndRecordDice: async () => {
  const { roomId, playerTelegramId } = get();
  if (!roomId || !playerTelegramId) {
    throw new Error('No active game room');
  }

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const roomRef = doc(db, 'gameRooms', roomId);

  await updateDoc(roomRef, {
    [`players.${playerTelegramId}.diceRoll`]: diceRoll,
    [`gameState.diceRolls.${playerTelegramId}`]: diceRoll
  });

  return diceRoll;
},

// Method to check if both players have rolled and determine first turn
checkDiceRollsAndSetTurn: async () => {
  const { roomId } = get();
  if (!roomId) return;
  const roomRef = doc(db, 'gameRooms', roomId);
  const roomSnapshot = await getDoc(roomRef);
  const roomData = roomSnapshot.data() as GameRoomDocument;

  if (!roomData) throw new Error('Room not found');

  const playerIds = Object.keys(roomData.players);
  
  // Check if both players have rolled
  if (playerIds.length === 2 &&
    playerIds.every(id => roomData.gameState?.diceRolls?.[id] !== undefined)) {
  
  // Ensure diceRolls is defined
  const diceRolls = roomData.gameState?.diceRolls;
  if (diceRolls) {
    const rolls = playerIds.map(id => ({
      id,
      roll: diceRolls[id]
    }));

    // Determine first player
    const firstPlayerId = rolls[0].roll > rolls[1].roll
      ? rolls[0].id
      : rolls[1].id;

    // Update room with first player
    await updateDoc(roomRef, {
      'gameState.currentTurn': firstPlayerId,
      status: 'inProgress'
    });
  } else {
    console.error('Dice rolls not available.');
  }
}
},

  selectCharacters: async (roomId: string, characterId: string) => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  //   const telegramUser = {
  //     id: 5532711018,
  //     username: 'doye',
  // };
    if (!telegramUser) {
      throw new Error('Telegram user not found');
    }
  
    const roomRef = doc(db, 'gameRooms', roomId);
    const playerCharacter = CHARACTERS.find((char) => char.id === characterId);
  
    if (!playerCharacter) throw new Error('Invalid character ID');
  
    const gameRoomDoc = await getDoc(roomRef);
  
    if (!gameRoomDoc.exists()) throw new Error('Game room not found');
  
    const isPlayer1 = gameRoomDoc.data()?.createdBy === telegramUser?.id;
  
    // const existingCharacterId = gameRoomDoc.data()?.players?.[telegramUser.id]?.characterId;
    // if (existingCharacterId) {
    //   throw new Error('Character already selected');
    // }
  
    await updateDoc(roomRef, {
      [`players.${telegramUser.id}.characterId`]: characterId,
      [`gameState.${isPlayer1 ? 'player1' : 'player2'}.character`]: playerCharacter,
      [`gameState.${isPlayer1 ? 'player1' : 'player2'}.currentHealth`]: playerCharacter.baseHealth,
      [`gameState.gameStatus`]: 'character-selected',
    });
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
          role: 'creator',
          diceRoll: null,
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
    // const telegramUser = {
    //     id: 5532711018,
    //     username: 'doye',
    // };
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
    // const telegramUser = {
    //   id: 5532711018,
    // };
  
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
      return []; // Return an empty array if no rooms are found
    }
  
    // Map through the documents and return an array of their data (or IDs)
    const rooms = querySnapshot.docs.map(doc => doc.data() as GameRoomDocument);
  
    return rooms;
  },

  findUserRooms: async () => {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    // const telegramUser = {
    //   id: 5532711018, 
    // };
  
    if (!telegramUser) {
      throw new Error('Telegram user not found');
    }
  
    const roomsRef = collection(db, 'gameRooms');
    
    // Query to find rooms where the user is a player (either player 1 or player 2)
    const q = query(
      roomsRef,
      where('players.' + telegramUser.id, '!=', null) // Check if the user's telegramId is in the players list
    );
  
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      return []; // Return an empty array if no rooms are found
    }
  
    // Map through the documents and return an array of their data (or IDs)
    const rooms = querySnapshot.docs.map(doc => doc.data() as GameRoomDocument);
  
    return rooms;
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
    const { roomId } = get(); //playerTelegramId
    // const playerTelegramId = 5532711018;
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!roomId || !telegramUser?.id) {
      console.error("Room ID or Player Telegram ID is missing.");
      return () => {}; // Return an empty unsubscribe function
    }
 
    const roomRef = doc(db, 'gameRooms', roomId);
 
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const roomData = snapshot.data() as GameRoomDocument;
 
      if (!roomData) {
        console.warn("Room data does not exist.");
        return;
      }
 
      // Extract players and game state from room data
      const players = Object.values(roomData.players || {});
      const player1 = players[0];
      const player2 = players[1];
 
      set((state) => ({
        gameState: {
          ...state.gameState,
          // Update Player 1 state
          player1: {
            ...state.gameState.player1,
            character: player1
              ? CHARACTERS.find((c) => c.id === player1.characterId)
              : state.gameState.player1.character,
            currentHealth: roomData.gameState?.player1?.currentHealth ?? state.gameState.player1.currentHealth,
          },
          // Update Player 2 state
          player2: {
            ...state.gameState.player2,
            character: player2
              ? CHARACTERS.find((c) => c.id === player2.characterId)
              : state.gameState.player2.character,
            currentHealth: roomData.gameState?.player2?.currentHealth ?? state.gameState.player2.currentHealth,
          },
          // Update game meta-state
          currentTurn: roomData.gameState?.currentTurn ?? state.gameState.currentTurn,
          gameStatus: roomData.status || state.gameState.gameStatus,
          lastAttack: roomData.gameState?.lastAttack ?? state.gameState.lastAttack,
        },
        roomId, // Sync roomId to ensure consistency
      }));
    });
    return unsubscribe;
  } 
}));

export default useOnlineGameStore;