import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import SportsDashboard from '../../src/components/Dashboard/SportsDashboard';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { Channel } from '../../src/types';

const MOCK_CHANNELS: any[] = [
  {
    id: '1',
    name: 'Real Madrid vs Barcelona',
    homeName: 'Real Madrid',
    awayName: 'Barcelona',
    category: 'Football',
    streamUrl: 'http://test.m3u8',
    thumbnail: 'http://thumb.jpg',
    homeLogo: 'http://home.png',
    awayLogo: 'http://away.png',
    score: '2-1',
    viewers: '1500',
    matchTime: '25:00',
    status: 'LIVE',
    isPremium: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('Frontend: SportsDashboard', () => {
  afterEach(cleanup);

  it('renders correctly with match data', () => {
    // Render the component within its Provider
    render(
      <LanguageProvider>
        <SportsDashboard channels={MOCK_CHANNELS} onSelect={() => {}} />
      </LanguageProvider>
    );
    
    // Check if team names and status are displayed
    expect(screen.getByText('Real Madrid')).toBeInTheDocument();
    expect(screen.getByText('Barcelona')).toBeInTheDocument();
    expect(screen.getByText('2-1')).toBeInTheDocument();
  });

  it('displays LIVE status for active matches', () => {
    render(
      <LanguageProvider>
        <SportsDashboard channels={MOCK_CHANNELS} onSelect={() => {}} />
      </LanguageProvider>
    );
    
    // Check for "LIVE" indicator
    const liveBadges = screen.getAllByText(/LIVE/i);
    expect(liveBadges.length).toBeGreaterThan(0);
  });
});
