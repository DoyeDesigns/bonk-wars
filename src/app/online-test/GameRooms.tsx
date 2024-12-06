import React, { useEffect, useState } from 'react';
import useOnlineGameStore from '@/store/online-game-store';
import { GameRoomDocument } from '@/store/online-game-store';

const GameRooms: React.FC = () => {
  const { findOpenGameRoom } = useOnlineGameStore();
  const [rooms, setRooms] = useState<GameRoomDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to fetch game rooms
  const fetchGameRooms = async () => {
    setLoading(true);
    try {
      const fetchedRooms = await findOpenGameRoom();
      if (fetchedRooms) {
        setRooms(fetchedRooms);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching game rooms', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchGameRooms();
  }, []);

  // Function to join a room
  const handleJoinRoom = async (roomId: string) => {
    try {
      // Replace this with your store's `joinGameRoom` function
      await useOnlineGameStore.getState().joinGameRoom(roomId);
      alert(`Successfully joined room: ${roomId}`);
    } catch (error) {
      console.error('Error joining room', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-200 via-yellow-200 to-teal-200 h-fit py-8 px-6 font-sans">
      <h1 className="text-4xl font-bold text-center text-teal-800 mb-8">Available Game Rooms</h1>

      {/* Refresh Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={fetchGameRooms}
          className="bg-blue-300 text-teal-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-blue-400"
        >
          Refresh Rooms
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center mb-8">
          <div className="animate-spin border-t-4 border-blue-500 border-solid w-12 h-12 rounded-full" />
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-center text-teal-700 font-semibold mb-6">
          No open rooms found. Please try refreshing.
        </p>
      ) : (
        // Game Room List
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
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
                Players: {room.players ? Object.keys(room.players).length : 0}/2
              </p>
              <p className="text-indigo-700">
                Status: {room.status || 'Open'}
              </p>
              <button
                onClick={() => handleJoinRoom(room.id)}
                className="mt-4 bg-purple-300 text-indigo-800 font-semibold py-2 px-4 rounded-md shadow-md hover:bg-purple-400"
              >
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameRooms;
