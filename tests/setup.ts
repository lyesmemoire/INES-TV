import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocking Redis
vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      ping: vi.fn().mockResolvedValue('PONG'),
    })),
  };
});

// Mocking NetInfo for Mobile context if used in Web
vi.mock('@react-native-community/netinfo', () => ({
  addEventListener: vi.fn(() => vi.fn()),
  fetch: vi.fn(),
}));

// Mocking Supabase
vi.mock('./src/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mocking LocalStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
    length: 0,
    key: (index: number) => null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mocking Next.js
vi.mock('next', () => {
  return {
    __esModule: true,
    default: vi.fn(() => ({
      prepare: vi.fn(() => Promise.resolve()),
      getRequestHandler: vi.fn(() => (req: any, res: any) => res.status(200).send('Next.js Handle')),
    })),
  };
});
