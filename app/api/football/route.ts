import { NextResponse } from 'next/server';

// Demo fallback data when API is unavailable or rate limited
const FALLBACK_MATCHES = [
  {
    id: 'demo-1',
    home: { name: 'Paris Saint-Germain', shortName: 'PSG' },
    away: { name: 'Olympique de Marseille', shortName: 'OM' },
    status: { scoreStr: '2 - 1', liveTime: { short: "67'" } },
  },
  {
    id: 'demo-2',
    home: { name: 'Real Madrid', shortName: 'RMA' },
    away: { name: 'FC Barcelona', shortName: 'BAR' },
    status: { scoreStr: '1 - 1', liveTime: { short: "34'" } },
  },
  {
    id: 'demo-3',
    home: { name: 'Manchester City', shortName: 'MCI' },
    away: { name: 'Liverpool FC', shortName: 'LIV' },
    status: { scoreStr: '0 - 0', liveTime: { short: "12'" } },
  },
  {
    id: 'demo-4',
    home: { name: 'Bayern Munich', shortName: 'BAY' },
    away: { name: 'Borussia Dortmund', shortName: 'BVB' },
    status: { scoreStr: '3 - 2', liveTime: { short: "89'" } },
  },
  {
    id: 'demo-5',
    home: { name: 'Juventus', shortName: 'JUV' },
    away: { name: 'AC Milan', shortName: 'ACM' },
    status: { scoreStr: '1 - 0', liveTime: { short: "55'" } },
  },
  {
    id: 'demo-6',
    home: { name: 'Inter Milan', shortName: 'INT' },
    away: { name: 'AS Roma', shortName: 'ROM' },
    status: { scoreStr: '2 - 0', liveTime: { short: "78'" } },
  },
];

export async function GET() {
  try {
    const apiKey = process.env.RAPIDAPI_FOOTBALL_KEY;
    if (!apiKey) {
      // No API key configured — return demo data
      return NextResponse.json(
        { status: 'success', response: { live: FALLBACK_MATCHES }, source: 'demo' },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    const response = await fetch(
      'https://free-api-live-football-data.p.rapidapi.com/football-current-live',
      {
        headers: {
          'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
        next: { revalidate: 60 }, // ISR cache for 60 seconds
      }
    );

    if (!response.ok) {
      console.warn(`RapidAPI returned ${response.status}, using fallback`);
      return NextResponse.json(
        { status: 'success', response: { live: FALLBACK_MATCHES }, source: 'fallback' },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
      );
    }

    const data = await response.json();

    // If API returned empty live array, supplement with fallback
    const liveMatches = data.response?.live;
    if (!liveMatches || liveMatches.length === 0) {
      return NextResponse.json(
        { status: 'success', response: { live: FALLBACK_MATCHES }, source: 'fallback-empty' },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Football API error:', error);
    return NextResponse.json(
      { status: 'success', response: { live: FALLBACK_MATCHES }, source: 'error-fallback' },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  }
}
