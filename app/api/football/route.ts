import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch(`https://free-api-live-football-data.p.rapidapi.com/football-current-live`, {
      headers: {
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_FOOTBALL_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch football data' }, { status: 500 });
  }
}
