import React, { useEffect, useState } from 'react';
import { GameRoomDocument, GameRoomPlayer } from '@/store/online-game-store';
import useOnlineGameStore from '@/store/online-game-store';
import { useRouter } from 'next/navigation';

const UserGameRooms = () => {
  const [gameRooms, setGameRooms] = useState<GameRoomDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'waiting' | 'inProgress' | 'character-select' | null>(null);

  const { joinGameRoom, findUserRooms } = useOnlineGameStore();
  const router = useRouter()

  const fetchUserGameRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const rooms = await findUserRooms();
      const filteredRooms = rooms?.filter(
        (room) => room.status === 'waiting' || room.status === 'inProgress' || room.status === 'character-select'
      );
      setGameRooms(filteredRooms || []);
    } catch (err) {
      setError('Failed to load game rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGameRooms();
  }, [findUserRooms]);
  

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinGameRoom(roomId);
      // Optionally add success notification or navigation
    } catch (err) {
      setError('Failed to join game room');
      console.error(err);
    } finally {
      router.push(`/game-play/${roomId}`);
    }
  };

  const sortedGameRooms = () => {
    if (!sortBy) return gameRooms;
    return [
      ...gameRooms.filter((room) => room.status === sortBy),
      ...gameRooms.filter((room) => room.status !== sortBy),
    ];
  };

  const getUsernameById = (players: { [telegramId: number]: GameRoomPlayer }, userId: number): string => {
    const player = players[userId];
    return player?.username || 'Unknown User';
  };

  return (
    <div className="w-full space-y-4 pb-[150px] mt-10">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-bold">Your Game Rooms</h2>
        <div className="flex gap-2">
        <button className="btn btn-sm btn-outline text-white hover:bg-background hover:text-white" onClick={fetchUserGameRooms}>
            Refresh
          </button>
        <div className="dropdown dropdown-left z-50">
          <div tabIndex={0} role="button" className="btn btn-sm h-8 btn-outline text-white hover:bg-background hover:text-white">Sort By</div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <button onClick={() => setSortBy('waiting')}>Waiting</button>
            </li>
            <li>
              <button onClick={() => setSortBy('inProgress')}>In Progress</button>
            </li>
            <li>
              <button onClick={() => setSortBy('character-select')}>Character select</button>
            </li>
            <li>
              <button onClick={() => setSortBy(null)}>Clear Sort</button>
            </li>
          </ul>
        </div>
        </div>
      </div>

      {loading && <p className="text-white text-center my-2">Loading your game rooms...</p>}

      {error && (
        <div className="alert alert-error bg-[#919090]/80 text-white">
          <div className="flex items-center">
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && gameRooms.length === 0 && (
        <p className="text-white text-center my-2">No game rooms found</p>
      )}

      {sortedGameRooms().map((gameRoom) => (
        <div key={gameRoom.id} className="card bg-[#393939] text-white shadow-xl">
          <div className="card-body p-5 h-fit">
            <h2 className="card-title text-[16px]">Game Room Details</h2>
            <div className="space-y-2 text-[14px]">
              <p>
                <strong>Room ID:</strong> {gameRoom.id}
              </p>
              <p>
                <strong>Created By:</strong> {getUsernameById(gameRoom.players, gameRoom.createdBy)}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className={`badge text-white border-none ${
                    gameRoom.status === 'character-select'
                      ? 'bg-yellow-700'
                      : 'bg-green-900'
                  } ml-2`}
                >
                  {gameRoom.status}
                </span>
              </p>
              <p>
                <strong>Players:</strong> {Object.keys(gameRoom.players).length}/2
              </p>
            </div>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => handleJoinRoom(gameRoom.id)}
                className="btn btn-sm bg-secondary text-black font-bold hover:bg-secondary/80 border-none"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserGameRooms;
