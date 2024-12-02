import React from 'react';
import Image from 'next/image';

export type Character = {
  name: string;
  specialty: string;
  attack: number;
  defence: number;
  abilities: Record<string, unknown>;
  img: string;
};

interface Step2Props {
  selectedItem: Character | null;
  onSelect: (item: Character) => void;
}

const items: Character[] = [
  {
    name: 'Donald Pump',
    specialty: 'Offensive Powerhouse',
    attack: 2,
    defence: 1,
    abilities: {},
    img: '/donald-pump.png'
  },
  {
    name: 'Abraham Lickin',
    specialty: 'Balanced Strategist',
    attack: 1,
    defence: 2,
    abilities: {},
    img: '/abraham-lickin.png'
  },
  {
    name: 'King Barkles III',
    specialty: 'Royal Defender',
    attack: 1,
    defence: 2,
    abilities: {},
    img: '/king-barkles.png'
  },
  {
    name: 'Vladmir Muffin',
    specialty: 'Tactical Distruptor',
    attack: 2,
    defence: 1,
    abilities: {},
    img: '/vladmir-muffin.png'
  },
];

function Step2(props: Step2Props) {
  const { selectedItem, onSelect } = props;

  return (
    <div>
      <h2 className="font-bold text-white mb-10 text-center">Select Warrior</h2>
      <div className="flex flex-col w-[350px] gap-4">
        {items.map((item) => (
          <div
            key={item.name} // Ensure each key is unique
            onClick={() => onSelect(item)} // Pass the selected item object
            className={`bg-[#090909] rounded-[10px] flex items-center justify-between h-[103px] p-4 cursor-pointer overflow-hidden ${
              selectedItem?.name === item.name ? 'border-2 border-primary' : ''
            }`}
          >
            <div>
              <h3 className="text-white font-bold text-[17px] mb-px">{item.name}</h3>
              <p className="text-secondary text-[13px] font-medium mb-px">Specialty: {item.specialty}</p>
              <div className='flex items-center gap-4'>
                <span className="text-primary text-[13px] font-medium flex gap-2 items-center">
                  Attack: {item.attack === 1 ? (<Image src='/1-star.png' alt='1-star' width={32} height={16} />) : (<Image src='/2-stars.png' alt='2-stars' width={32} height={16} />)} 
                </span>
                <span className='text-primary text-[13px] font-medium flex gap-2 items-center'>
                Defence: {item.defence === 1 ? (<Image src='/1-star.png' alt='1-star' width={32} height={16} />) : (<Image src='/2-stars.png' alt='2-stars' width={32} height={16} />)}
                </span>
              </div>
            </div>
            <Image className={`${item.name === 'Vladmir Muffin' ? 'mt-4' : ''}`} src={item.img} alt={item.name} width={101} height={142}/>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step2;
