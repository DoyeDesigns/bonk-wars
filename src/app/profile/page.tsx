'use client'

import React from 'react'
import Image from 'next/image'
import { useUser } from '@/contexts/TelegramContext'

export default function Profile() {
    const { user } = useUser();
  return (
    <main className='h-full overflow-auto bg-background flex flex-col justify-between'>
        <div>
        <div className='flex gap-5 justify-center pt-6 pb-8'>
            <div>
                <div className="avatar mt-2">
                    <div className="ring-[#f0b803] ring-offset-background w-[94px] h-[94px] rounded-full ring ring-offset-2">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
            </div>

            <div className='text-white'>
                <span className='block text-xl font-bold'>Jandounchaind</span>
                <span className='inline-flex items-center text-[15px] font-normal uppercase mt-2 mb-[14px]'>{user ? user?.id : "ID: 0A45R1AO"}  <button className='mt-px ml-2'><Image src='/copy.png' alt='copy' width={20} height={20} /></button></span>
                <button className='btn flex justify-center items-center bg-accent h-10 w-[201px] text-white font-bold'><Image src='/wallet.png' alt='wallet' width={20} height={20}/> Connect Wallet</button>
            </div>
        </div>
        <div className="h-px bg-[#6A6868]"></div>
        <div className='flex gap-10 justify-center items-center pt-7 pb-6'>
            <div className='flex flex-col'>
                <h1 className='font-bold text-[16px] text-white mb-2'>14,000,000 <span>$BNK</span></h1>
                <span className='font-normal text-[15px] text-secondary'>Total Earned</span>
            </div>
            <div className='flex flex-col'>
                <span className='font-bold text-[16px] text-white mb-2 block'>3</span>
                <span className='font-normal text-[15px] text-white block'>Battles</span>
            </div>
            <div className='flex flex-col'>
                <span className='font-bold text-[16px] text-white mb-2 block'>2</span>
                <span className='font-normal text-[15px] text-white block'>wins</span>
            </div>
        </div>
        <div className="h-px bg-[#6A6868]"></div>
        <div className='flex gap-[200px] justify-center items-center pt-[32px] pb-[18px] text-white'>
            <h2 className='font-bold text-[16px]'>History</h2>
            <button className='text-xs flex gap-2 items-center'><Image src='/refresh.png' alt='refresh' width={20} height={20} /> Refresh</button>
        </div>
        <div className="h-px bg-[#6A6868]"></div>
        <div className='flex flex-col items-center pb-[150px] overflow-auto pt-[18px] gap-[6px]'>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-won-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Won</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-secondary uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-secondary'>+<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
            <div className='bg-[#393939] h-[66px] rounded-[10px] flex justify-between items-center w-[364px] min-w-[250px] pr-[18px] pl-8 mx-2'>
                <div className='flex gap-3 items-center'>
                    <Image src='/history-lost-img.png' alt='history-won-img.png' width={39} height={39}/>
                    <div>
                        <h3 className='font-semibold text-[18px] text-white'>Lose</h3>
                        <span className='text-white text-[13px]'>vs <span className='text-accent uppercase'>07FR10TAM</span></span>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='text-[13px] block text-accent'>-<span>7,000,000<span>$BNK</span></span></span>
                    <div><span className='text-[11px] text-white'>Nov 27, 2024 | 4:32pm</span></div>
                </div>
            </div>
        </div>
        </div>
    </main>
  )
}
