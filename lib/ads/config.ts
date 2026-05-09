import { AdConfig } from './types';

export const AD_CONFIG: AdConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  frequency: {
    popUnderMinutes: 60, // Limit pops to once per hour
  },
};

export const AD_PLACEMENTS = {
  HEADER: 'header',
  SIDEBAR: 'sidebar',
  CONTENT: 'in-content',
  PLAYER: 'player-pop',
} as const;
