import fetch from 'node-fetch';
import { z } from "zod";

// CricAPI response interfaces
interface CricAPICurrent {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: {
    name: string;
    shortname: string;
    img: string;
  }[];
  score: {
    r: number;
    w: number;
    o: number;
    inning: string;
  }[];
}

interface CricAPIResponse {
  apikey: string;
  data: CricAPICurrent[];
  status: string;
  reason?: string; // Error reason when status is failure
  info?: {
    hitsToday: number;
    hitsUsed: number;
    hitsLimit: number;
    credits: number;
    server: number;
    offsetRows: number;
    totalRows: number;
    cache: number;
    queryTime: number;
    s: number;
    e: number;
  };
}

export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  teams: {
    name: string;
    shortName: string;
    imageUrl?: string;
  }[];
  scores: {
    team: string;
    runs: number;
    wickets: number;
    overs: number;
  }[];
  currentOver?: string;
}

const apiKey = process.env.CRICAPI_KEY;

if (!apiKey) {
  console.error('CricAPI key not found. Please set CRICAPI_KEY in Secrets.');
}

export async function getCurrentMatches(): Promise<CricketMatch[]> {
  try {
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const url = `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`;

    const response = await fetch(url, { 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CricAPI error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json() as CricAPIResponse;

    if (data.status !== 'success' || !data.data) {
      console.error('CricAPI returned error:', data);
      throw new Error(data.reason || 'API returned unsuccessful status');
    }

    // Transform API response into our application's format
    return data.data.map(match => {
      // Create a scores array
      const scores = (match.score || []).map(s => {
        if (!s || !s.inning) return null;
        const teamName = s.inning.split(' ')[0]; // e.g. "India 1st Innings" -> "India"
        return {
          team: teamName,
          runs: s.r || 0,
          wickets: s.w || 0,
          overs: s.o || 0
        };
      }).filter(s => s !== null);

      // Extract teams data
      const teams = match.teams.map((team, index) => {
        const teamInfo = match.teamInfo.find(t => t.name === team);
        return {
          name: team,
          shortName: teamInfo?.shortname || team.substring(0, 3).toUpperCase(),
          imageUrl: teamInfo?.img
        };
      });

      // Create a current over string from the most recent score
      const lastScore = match.score[match.score.length - 1];
      const currentOver = lastScore ? `${lastScore.o}` : undefined;

      return {
        id: match.id,
        name: match.name,
        matchType: match.matchType,
        status: match.status,
        venue: match.venue,
        date: match.date,
        teams,
        scores,
        currentOver
      };
    });

  } catch (error) {
    console.error('Error fetching cricket matches:', error);
    throw error;
  }
}