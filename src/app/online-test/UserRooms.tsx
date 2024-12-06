import React, { useEffect, useState } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { GameRoomDocument } from '@/store/online-game-store';


const JoinedRooms: React.FC = () => {
  const { findUserRooms, setRoomId } = useOnlineGameStore(); // Custom hook or store function to fetch joined rooms
  const [joinedRooms, setJoinedRooms] = useState<GameRoomDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleJoinRoom = (roomId: string) => {
    // Update the store with the selected roomId
    setRoomId(roomId);
    console.log(roomId);
  };

  // Function to fetch joined rooms
  const fetchJoinedRooms = async () => {
    setLoading(true);
    try {
      const rooms = await findUserRooms(); // Assuming `getJoinedRooms` returns the rooms the user has joined
      setJoinedRooms(rooms || []);
    } catch (error) {
      console.error('Error fetching joined rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch joined rooms on component mount
  useEffect(() => {
    fetchJoinedRooms();
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-200 via-blue-200 to-teal-200 h-fit py-8 px-6 font-sans">
      <h1 className="text-4xl font-bold text-center text-teal-800 mb-8">Your Joined Game Rooms</h1>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center mb-8">
          <div className="animate-spin border-t-4 border-blue-500 border-solid w-12 h-12 rounded-full" />
        </div>
      ) : joinedRooms.length === 0 ? (
        <p className="text-center text-teal-700 font-semibold mb-6">
          You have not joined any rooms yet. Please join a room to start playing.
        </p>
      ) : (
        // Display joined rooms
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-6 rounded-lg shadow-md transition transform hover:scale-105"
            >
              <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                Room ID: {room.id}
              </h2>
              <p className="text-indigo-700">
                Created By: {room.createdBy || 'Unknown'}
              </p>
              <p className="text-indigo-700">
                Status: {room.status || 'Unknown'}
              </p>
              <p className="text-indigo-700 mb-4">
                Created At: {room.createdAt.toDate().toLocaleString()}
              </p>

              <h3 className="text-xl font-semibold text-indigo-600 mb-2">Players:</h3>
              <div className="space-y-2">
                {Object.values(room.players).map((player) => (
                  <div key={player.telegramId} className="bg-gray-100 p-4 rounded-md shadow-sm">
                    <p className="text-indigo-700 font-semibold">{player.username || 'Unknown User'}</p>
                    <p className="text-indigo-700">Role: {player.role}</p>
                    <p className="text-indigo-700">
                      Character: {player.characterId ? player.characterId : 'None Selected'}
                    </p>
                  </div>
                ))}
              </div>
              <div className='flex justify-center mt-4'>
              <button
              onClick={() => handleJoinRoom(room.id)}
              className="mt-4 bg-purple-300 text-indigo-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-purple-400"
            >
              Join Room
            </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinedRooms;
