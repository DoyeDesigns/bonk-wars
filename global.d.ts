// global.d.ts
interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    initDataUnsafe?: {
      user?: {
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
      };
    };
  }
  
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
  