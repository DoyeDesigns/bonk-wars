'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface TelegramContext {
  user: TelegramUser | null;
}

const TelegramContext = createContext<TelegramContext | undefined>(undefined);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (window?.Telegram && window?.Telegram?.WebApp) {
      const tele = window?.Telegram?.WebApp;
      tele.ready();
      tele.expand();
      const telegramUser = tele.initDataUnsafe?.user;

      if (telegramUser && !user) {
        setUser(telegramUser);
      } else (
        console.log("Not in Telegram Window")
      )
    }
  }, [user]);

  return (
    <TelegramContext.Provider value={{ user }}>
      {children}
    </TelegramContext.Provider>
  );
}

// Custom hook for consuming the UserContext
export function useUser(): TelegramContext {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
