import React from 'react';
import Image from 'next/image';

function Step3() {

  return (
    <div className='flex flex-col gap-[18px] items-center justify-center mb-[40px] pt-[240px]'>
      <span className='font-bold text-white'>Waiting for player...</span>
      <span className="loading loading-dots loading-lg bg-primary"></span>
    </div>
  );
}

export default Step3;
