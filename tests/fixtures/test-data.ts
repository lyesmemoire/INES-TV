/**
 * Global Test Data for INES TV E2E Suites
 */
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

export const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'adminpassword123',
  name: 'Admin User'
};

export const MOCK_CHANNELS = [
  {
    id: 'bein_sport_1',
    name: 'beIN SPORTS 1',
    category: 'Sports',
    logo: 'https://example.com/bein1.png',
    live: true
  },
  {
    id: 'canal_plus',
    name: 'Canal+',
    category: 'Cinema',
    logo: 'https://example.com/canal.png',
    live: false
  },
  {
    id: 'tf1',
    name: 'TF1',
    category: 'General',
    logo: 'https://example.com/tf1.png',
    live: true
  }
];
