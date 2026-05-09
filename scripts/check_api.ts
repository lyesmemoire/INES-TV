import * as dotenv from 'dotenv';
dotenv.config();
import { fetchLiveMatches, FootballMatch } from '../src/lib/footballService';

async function main() {
  console.log("🌍 Fetching live matches from API...");
  try {
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY || '',
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`❌ API Fetch failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${body}`);
      return;
    }
    const data = await response.json();
    const matches: FootballMatch[] = data.matches || [];

    console.log(`✅ Found ${matches.length} matches.`);
    matches.slice(0, 10).forEach((m: FootballMatch) => {
      console.log(` - ${m.homeTeam} vs ${m.awayTeam} (ID: ${m.id}) [${m.status}]`);
    });
  } catch (err) {
    console.error("❌ API Fetch failed:", err);
  }
}

main();
