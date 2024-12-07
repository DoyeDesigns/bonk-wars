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
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CHARACTERS, Character, Ability } from '@/lib/characters';
import { Timestamp } from 'firebase/firestore';

type UpdateData = {
  [key: string]: number | string | null;
};

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
    id: number | null;
    character?: Character;
    currentHealth: number;
    defenseInventory: DefenseInventory;
    skippedDefense?: {
      ability: Ability;
      damage: number;
    };
  };
  player2: {
    id: number | null;
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
  performAttack: (attackingPlayer: 'player1' | 'player2', ability: Ability) => void;
  useDefense: (
    defendingPlayer: 'player1' | 'player2',
    defenseAbility: Ability,
    incomingDamage: number
  ) => Promise<boolean>;
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
      id: null,
      character: CHARACTERS[0],
      currentHealth: CHARACTERS[0].baseHealth,
      defenseInventory: {},
    },
    player2: {
      id: null,
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

  const { players, gameState } = roomData;
  if (!players || !gameState?.diceRolls) {
    console.error('Players or dice rolls are missing.');
    return;
  }

  const diceRolls = gameState.diceRolls;
  const playerIds = Object.keys(players);

  // Ensure exactly two players are present and both have rolled dice
  if (
    playerIds.length !== 2 ||
    playerIds.some((id) => diceRolls[id] === undefined)
  ) {
    console.error('Not all players have rolled their dice.');
    return;
  }

  // Map player IDs to roles (player1 and player2)
  const [player1Id, player2Id] = playerIds;
  const playerRoles = {
    player1: { id: player1Id, roll: gameState.diceRolls[player1Id] },
    player2: { id: player2Id, roll: gameState.diceRolls[player2Id] },
  };

  // Determine the first player based on the dice rolls
  const firstPlayer =
    playerRoles.player1.roll > playerRoles.player2.roll
      ? 'player1'
      : 'player2';

  // Prepare updates for Firestore
  const updates = {
    'gameState.player1': {
      id: player1Id,
    },
    'gameState.player2': {
      id: player2Id,
    },
    'gameState.currentTurn': firstPlayer,
    'gameState.status': 'inProgress',
  };

  try {
    // Perform a single Firestore update for efficiency
    await updateDoc(roomRef, updates);
    console.log('Game state updated successfully.');
  } catch (error) {
    console.error('Failed to update game state:', error);
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
  
    const existingCharacterId = gameRoomDoc.data()?.players?.[telegramUser.id]?.characterId;
    if (existingCharacterId) {
      throw new Error('Character already selected');
    }
  
    const batch = writeBatch(db);

  batch.update(roomRef, {
    [`players.${telegramUser.id}.characterId`]: characterId,
    [`gameState.${isPlayer1 ? 'player1' : 'player2'}.character`]: playerCharacter,
    [`gameState.${isPlayer1 ? 'player1' : 'player2'}.currentHealth`]: playerCharacter.baseHealth,
    [`gameState.gameStatus`]: 'character-selected',
  });

  try {
    await batch.commit();
    console.log('Character selection updated successfully for:', telegramUser.username);
  } catch (error) {
    console.error('Failed to select character:', error);
    throw new Error('Failed to update the game room. Please try again.');
  }
  },


  addDefenseToInventory: async (player, defenseType) => {
    const { roomId, gameState } = get();
    if (!roomId) throw new Error('No active game room');
  
    const roomRef = doc(db, 'gameRooms', roomId);
    const nextPlayer = player === 'player1' ? 'player2' : 'player1';
  
    // Prepare the update for Firestore
    const updateData = {
      [`gameState.${player}.defenseInventory.${defenseType}`]: 
        (gameState[player].defenseInventory[defenseType] || 0) + 1,
      'gameState.currentTurn': nextPlayer,
    };
  
    try {
      // Update backend first
      await updateDoc(roomRef, updateData);
  
      // Local state update will be handled by the onSnapshot listener in init()
    } catch (error) {
      console.error('Error adding defense to inventory:', error);
      throw error;
    }
  },
  
  skipDefense: async (defendingPlayer, incomingDamage, ability) => {
    const { roomId, gameState } = get();
    if (!roomId) throw new Error('No active game room');
  
    const roomRef = doc(db, 'gameRooms', roomId);
  
    // Prepare the update for Firestore
    const updateData = {
      [`gameState.${defendingPlayer}.currentHealth`]: 
        gameState[defendingPlayer].currentHealth - incomingDamage,
      [`gameState.${defendingPlayer}.skippedDefense`]: {
        ability,
        damage: incomingDamage
      },
      'gameState.currentTurn': defendingPlayer,
      ...(gameState[defendingPlayer].currentHealth - incomingDamage <= 0 
        ? { status: 'finished' } 
        : {}),
    };
  
    try {
      // Update backend first
      await updateDoc(roomRef, updateData);
  
      // Local state update will be handled by the onSnapshot listener in init()
    } catch (error) {
      console.error('Error skipping defense:', error);
      throw error;
    }
  },
  
  useDefense: async (defendingPlayer, defenseAbility, incomingDamage) => {
    const { roomId, gameState } = get();
    if (!roomId) throw new Error('No active game room');
  
    if (!defenseAbility?.defenseType) {
      console.error('Invalid defense ability provided');
      return false;
    }
  
    const opponentPlayer = defendingPlayer === 'player1' ? 'player2' : 'player1';
    const defenseType = defenseAbility.defenseType;
  
    // Check if defense is available in inventory
    if ((gameState[defendingPlayer].defenseInventory[defenseType] || 0) <= 0) {
      return false;
    }
  
    const roomRef = doc(db, 'gameRooms', roomId);
  
    // Prepare the update for Firestore
    const updateData: UpdateData = {
      [`gameState.${defendingPlayer}.defenseInventory.${defenseType}`]: 
        (gameState[defendingPlayer].defenseInventory[defenseType] || 1) - 1,
      [`gameState.${defendingPlayer}.skippedDefense`]: null,
    };
  
    // Apply defense-specific logic
    switch (defenseType) {
      case 'dodge':
        // No damage, keep current turn
        updateData['gameState.currentTurn'] = defendingPlayer;
        break;
  
      case 'reflect':
        // Reflect damage back to opponent
        updateData[`gameState.${opponentPlayer}.currentHealth`] = 
          gameState[opponentPlayer].currentHealth - incomingDamage;
        updateData['gameState.currentTurn'] = opponentPlayer;
        break;
  
      case 'block':
        // Reduce incoming damage
        updateData[`gameState.${defendingPlayer}.currentHealth`] = 
          gameState[defendingPlayer].currentHealth - Math.max(0, incomingDamage - 25);
        updateData['gameState.currentTurn'] = opponentPlayer;
        break;
  
      default:
        console.error('Unknown defense type');
        return false;
    }
  
    // Check if game is over
    if (gameState[opponentPlayer].currentHealth - (defenseType === 'reflect' ? incomingDamage : 0) <= 0 ||
        gameState[defendingPlayer].currentHealth - 
        (defenseType === 'block' ? Math.max(0, incomingDamage - 25) : 
         defenseType === 'dodge' ? 0 : incomingDamage) <= 0) {
      updateData['status'] = 'finished';
    }
  
    try {
      // Update backend first
      await updateDoc(roomRef, updateData);
  
      // Local state update will be handled by the onSnapshot listener in init()
      return true;
    } catch (error) {
      console.error('Error using defense:', error);
      throw error;
    }
  },
  
  performAttack: async (attackingPlayer, ability) => {
    const { roomId } = get();
    if (!roomId) throw new Error('No active game room');
  
    const opponentKey = attackingPlayer === 'player1' ? 'player2' : 'player1';
    const roomRef = doc(db, 'gameRooms', roomId);
  
    // Prepare the update for Firestore
    const updateData = {
      'gameState.currentTurn': opponentKey,
      'gameState.lastAttack': { 
        ability, 
        attackingPlayer 
      }
    };
  
    try {
      // Update backend first
      await updateDoc(roomRef, updateData);
  
      // Local state update will be handled by the onSnapshot listener in init()
    } catch (error) {
      console.error('Error performing attack:', error);
      throw error;
    }
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
          id: null,
          character: CHARACTERS[0],
          currentHealth: CHARACTERS[0].baseHealth,
          defenseInventory: {},
        },
        player2: {
          id: null,
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
    // const telegramUser = {id: 5532711018};
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