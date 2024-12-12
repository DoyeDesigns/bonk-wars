import Image from "next/image";
import React, { useEffect, useState } from "react";
import useOnlineGameStore from "@/store/online-game-store";
import { GameRoomDocument } from "@/store/online-game-store";
import { TelegramUser } from "@/contexts/telegram-context";

interface PlayerStatisticsProps {
  user: TelegramUser | null;
}


export default function PlayerStatistics({user} : PlayerStatisticsProps) {
  const { findUserRooms } = useOnlineGameStore(); // Custom hook or store function to fetch joined rooms
  const [joinedRooms, setJoinedRooms] = useState<GameRoomDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [statistics, setStatistics] = useState({
    totalBattles: 0,
    totalWins: 0,
    totalEarnings: 0
  });

  const calculateStatistics = (rooms: GameRoomDocument[]) => {
    const stats = rooms.reduce((acc, room) => {
      // Check if the room is finished to count as a battle
      if (room.status === 'finished') {
        acc.totalBattles++;

        // Check if the current user is the winner
        const gameState = room.gameState;
        if (gameState) {
          // Determine winner based on user ID
          const isPlayer1 = gameState.player1.id === user?.id;//user?.id
          const isPlayer2 = gameState.player2.id === user?.id;

          if ((isPlayer1 && gameState.winner === 'player1') || 
              (isPlayer2 && gameState.winner === 'player2')) {
            acc.totalWins++;
          }
        }

        // If you have a way to track earnings per game, add logic here
        // For now, this is a placeholder
        // acc.totalEarnings += calculateEarningsForRoom(room);
      }

      return acc;
    }, {
      totalBattles: 0,
      totalWins: 0,
      totalEarnings: 0
    });

    setStatistics(stats);
  };

  const fetchJoinedRooms = async () => {
    setLoading(true);
    try {
      const rooms = await findUserRooms();
      
      // Sort rooms by date in descending order
      const sortedRooms = (rooms || []).sort((a, b) => {
        // Assuming createdAt is a Firestore Timestamp
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      
      setJoinedRooms(sortedRooms);
      
      // Calculate statistics after fetching rooms
      calculateStatistics(sortedRooms);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
    } finally {
      setLoading(false);
    }
  };


  const didUserWin = (room: GameRoomDocument, userId: number | undefined) => {
    return (room.gameState?.winner === 'player1' && room.gameState.player1.id === userId) ||
           (room.gameState?.winner === 'player2' && room.gameState.player2.id === userId);
  };

  useEffect(() => {
    fetchJoinedRooms();
  }, []);

  return (
    <div>
    {loading ? (<div className="flex justify-center"><span className="loading loading-dots loading-lg bg-primary"></span></div>) : joinedRooms.length === 0 ? (
        <p className="text-center text-white font-semibold my-6">
          You have not joined any rooms yet. Please join a room to start playing.
        </p>
      ) : (
        <div>
            <div className="flex gap-10 justify-center items-center pt-7 pb-6">
        <div className="flex flex-col">
          <h1 className="font-bold text-[16px] text-white mb-2">
          {statistics.totalEarnings.toLocaleString()} <span>$BNK</span>
          </h1>
          <span className="font-normal text-[15px] text-secondary">
            Total Earned
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[16px] text-white mb-2 block">{statistics.totalBattles}</span>
          <span className="font-normal text-[15px] text-white block">
            Battles
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[16px] text-white mb-2 block">{statistics.totalWins}</span>
          <span className="font-normal text-[15px] text-white block">Wins</span>
        </div>
      </div>
      <div className="h-px bg-[#6A6868]"></div>
      <div className="flex gap-[200px] justify-center items-center pt-[32px] pb-[18px] text-white">
        <h2 className="font-bold text-[16px]">History</h2>
        <button onClick={fetchJoinedRooms} className="text-xs flex gap-2 items-center">
          <Image src="/refresh.png" alt="refresh" width={20} height={20} />{" "}
          Refresh
        </button>
      </div>
      <div className="h-px bg-[#6A6868]"></div>
      <div className="flex flex-col items-center pb-[150px] overflow-auto pt-[18px] gap-[6px]">
        {joinedRooms.map((room) => (
            <div key={room.id} className="bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2">
            <div className="flex gap-3 items-center">
              <Image
                src={didUserWin(room, user?.id) ? "/history-won-img.png" : "/history-lost-img.png"}
                alt={didUserWin(room, user?.id) ? "history-won-img.png" : "history-lost-img.png"}
                width={39}
                height={39}
              />
              <div>
                <h3 className="font-semibold text-[18px] text-white">{didUserWin(room, user?.id) ? 'Won' : 'Lost'}</h3>
                <span className="text-white text-[13px]">
                  vs <span className="text-secondary uppercase"> {Object.values(room.players)
                          .find(player => player.telegramId !== user?.id)
                          ?.username || 'Unknown'}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[13px] block text-secondary">
                +
                <span>
                  7,000,000<span>$BNK</span>
                </span>
              </span>
              <div>
                <span className="text-[11px] text-white">
                {new Date(room.createdAt.toDate()).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
    )}
      
    </div>
  );
}
