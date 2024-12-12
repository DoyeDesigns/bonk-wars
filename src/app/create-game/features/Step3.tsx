import React from 'react';
import { useToast } from '@/contexts/toast-context';

function Step3({roomId} : {roomId : string}) {
  const { addToast } = useToast();

  function handleClick(roomId: string) {
    navigator.clipboard.writeText(roomId)
    addToast('Copied room Id to clipboard', 'info')
  };

  return (
    <div className='flex flex-col gap-[18px] items-center justify-center mb-[40px] pt-[240px]'>
      <span className='font-bold text-white'>This is your game room ID click to copy <button className='text-primary animate-pulse' onClick={() => handleClick(roomId)}>{roomId}</button>. Share with a friend to begin battle!</span>
      <span className="loading loading-dots loading-lg bg-primary"></span>
    </div>
  );
}

export default Step3;
