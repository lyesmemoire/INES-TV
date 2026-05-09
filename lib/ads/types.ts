export type AdPlacement = 'header' | 'sidebar' | 'in-content' | 'player-pop';

export interface AdConfig {
  enabled: boolean;
  debug: boolean;
  frequency: {
    popUnderMinutes: number;
  };
}

export interface AdState {
  adblockDetected: boolean;
  popShownCount: number;
  lastPopTime: number | null;
}
