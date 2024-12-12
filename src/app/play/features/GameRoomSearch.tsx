'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { GameRoomDocument } from '@/store/online-game-store';
import useOnlineGameStore from '@/store/online-game-store';
import { useRouter } from 'next/navigation';

const GameRoomSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gameRoom, setGameRoom] = useState<GameRoomDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { joinGameRoom } = useOnlineGameStore();
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a valid Game Room ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Reference to the specific game room document
      const roomRef = doc(collection(db, 'gameRooms'), searchQuery);
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.data() as GameRoomDocument;
        setGameRoom({
          ...roomData,
          id: roomSnapshot.id
        });
      } else {
        setError('No game room found with this ID');
        setGameRoom(null);
      }
    } catch (err) {
      setError('Error searching for game room');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!gameRoom) return;

    try {
      await joinGameRoom(gameRoom.id);
      router.push(`/game-play/${gameRoom.id}`);
      // Optionally add success notification or navigation
    } catch (err) {
      setError('Failed to join game room');
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-4 mb-5">
      <div className="flex flex-col">
      <label className="input !bg-[#919090]/50 input-bordered flex items-center gap-2 mb-4">
      <Image src='/search.png' alt='search' width={24} height={24} />
        <input 
          type="text" 
          placeholder="Search for Game ID" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="grow border-none h-[54px] text-white" 
        />
        </label>
        <button 
          onClick={handleSearch} 
          disabled={loading}
          className='btn h-12 bg-primary hover:bg-primary w-full active:bg-primary/80 active:text-white text-white hover:bg-primary/80 mb-4'
        >
          {loading ? (<span className="text-white">Searching...</span>) : (<span className="text-white">Search</span>)}
        </button>
      </div>

      {error && (
        <div className="alert alert-error bg-[#919090]/80 text-white !mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {gameRoom && (
        <div 
          className={`card my-3 bg-[#393939] text-white shadow-xl`}
        >
          <div className="card-body p-5 h-fit">
            <h2 className="card-title text-[16px]">Game Room Details</h2>
            <div className="space-y-2 text-[14px]">
              <p>
                <strong>Room ID:</strong> {gameRoom.id}
              </p>
              <p>
                <strong>Created By:</strong> {gameRoom.createdBy}
              </p>
              <p>
                <strong>Status:</strong> 
                <span 
                  className={`badge text-white border-none ${
                    gameRoom.status === 'waiting' 
                      ? 'bg-yellow-700' 
                      : gameRoom.status === 'inProgress'
                      ? 'bg-green-900'
                      : 'badge-ghost'
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
                onClick={handleJoinRoom}
                disabled={gameRoom.status !== 'character-select'}
                className="btn btn-sm bg-secondary text-black font-bold hover:bg-secondary/80 border-none"
              >
                {gameRoom.status === 'waiting' || gameRoom.status === 'character-select' ? 'Join Room' : 'Room Unavailable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoomSearch;