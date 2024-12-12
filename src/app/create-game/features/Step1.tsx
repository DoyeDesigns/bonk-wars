import React from 'react';
import Image from 'next/image';

interface Step1Props {
  value: number;
  onChange: (value: number) => void;
}

const tokenAmounts = [100000, 500000, 1000000, 5000000, 10000000];

const Step1: React.FC<Step1Props> = ({ value, onChange }) => {
  const handlePresetClick = (amount: number) => {
    onChange(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='flex justify-center mb-4'>
        <Image
          src="/create-game-header-img.png"
          alt="Create Game Header Image"
          width={135}
          height={76}
        />
      </div>
      <h1 className='font-bold text-[19px] text-white mb-9 text-center'>Stake tokens</h1>

      <div className='w-[350px] rounded-[10px] bg-[#1A1A1A] h-fit border border-[#3B3B3B] px-6 pt-[18px] pb-[35px]'>
      <div className='flex items-center justify-between mb-7'>
        <span className='text-white text-[15px]'>Select Token Amount</span>
        <span className='bg-white rounded-[7px] h-[38px] px-[10px] inline-flex justify-center items-center text-primary font-extrabold text-[15px]'>$BONK</span>
      </div>

      {/* Preset Token Amounts */}
      <div className='flex flex-wrap gap-2 mb-[30px]'>
        {tokenAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className='bg-[#414141] px-4 rounded-[8px] h-[34px] text-white text[15px] w-fit'
          >
            {amount.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div>
        <input
          id="step1-input"
          type="number"
          value={value || ''}
          placeholder="Custom Stake"
          onChange={handleInputChange}
          className='bg-[#414141] rounded-[5px] h-12 w-full px-[25px] text-white'
        />
      </div>
      </div>
    </div>
  );
};

export default Step1;
