// export interface GameRoom {
//     id: string;                   // Unique game room identifier
//     createdBy: string;            // UID of game creator
//     status: 'waiting' | 'inProgress' | 'finished';
//     players: {
//       [playerUID: string]: {
//         uid: string;
//         displayName: string;
//         characterId: string;
//         joinedAt: number;
//         role: 'creator' | 'challenger';
//       }
//     };
//     gameConfig: {
//       maxPlayers: number;
//       spectatorLimit: number;
//     };
//     metrics: {
//       startTime: number;
//       endTime?: number;
//       totalRounds: number;
//       winner?: string;
//     };
//   }

//   export interface GameState {
//     roomId: string;
//     currentTurn: string;           // UID of current player
//     player1: PlayerGameState;
//     player2: PlayerGameState;
//     lastAction: {
//       type: 'attack' | 'defense';
//       timestamp: number;
//       details: any;
//     };
//   }
  
//   export interface PlayerGameState {
//     uid: string;
//     characterId: string;
//     health: number;
//     defenseInventory: Record<string, number>;
//     actions: GameAction[];
//   }
  
//   export interface GameAction {
//     type: 'attack' | 'defense' | 'roll';
//     timestamp: number;
//     details: any;
//   }