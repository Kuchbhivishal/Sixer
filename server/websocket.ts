import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getCurrentMatches, CricketMatch } from "./services/cricket-api";

// Interface for WebSocket messages
interface WebSocketMessage {
  type: string;
  data: any;
}

// Keep track of connected clients
interface Client {
  ws: WebSocket;
  userId?: number;
}

// Application match format - must match what the frontend expects
interface AppMatch {
  id: number;
  tournament: string | null;
  team1: string;
  team2: string;
  team1Score: string | null;
  team2Score: string | null;
  status: string;
  venue: string | null;
  matchInfo?: string | null;
  currentOver?: string | null;
  startTime: Date | string;
}

export function setupWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients: Client[] = [];
  
  wss.on('connection', (ws) => {
    const client: Client = { ws };
    clients.push(client);
    
    ws.on('message', async (message) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
        
        // Handle authentication
        if (parsedMessage.type === 'AUTH' && parsedMessage.data?.userId) {
          client.userId = parsedMessage.data.userId;
          
          // Send initial data upon successful authentication
          if (client.userId) {
            const portfolio = await storage.getUserPortfolioSummary(client.userId);
            const holdings = await storage.getUserHoldings(client.userId);
            const liveMatches = await storage.getLiveMatches();
            const trendingPlayers = await storage.getTrendingPlayers(10);
            
            ws.send(JSON.stringify({
              type: 'INITIAL_DATA',
              data: {
                portfolio,
                holdings,
                liveMatches,
                trendingPlayers
              }
            }));
          }
        }
        
        // Handle subscription to specific data
        if (parsedMessage.type === 'SUBSCRIBE') {
          // Could implement specific data subscriptions here
        }
        
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      const index = clients.findIndex(c => c.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
    
    // Send initial public data
    sendInitialPublicData(ws);
  });
  
  // Set up periodic updates
  setInterval(async () => {
    try {
      // Fetch live cricket matches from API
      const cricketMatches = await getCurrentMatches();
      
      if (cricketMatches.length > 0) {
        // Convert cricket API matches to our app format
        const liveMatches: AppMatch[] = cricketMatches.map(match => {
          // Find the scores for both teams
          const team1Score = match.scores.find(s => s.team === match.teams[0]?.name);
          const team2Score = match.scores.find(s => s.team === match.teams[1]?.name);
          
          return {
            id: parseInt(match.id) || Math.floor(Math.random() * 10000), // Fallback random ID if needed
            tournament: match.matchType,
            team1: match.teams[0]?.name || "Team 1",
            team2: match.teams[1]?.name || "Team 2",
            team1Score: team1Score ? `${team1Score.runs}/${team1Score.wickets}` : "",
            team2Score: team2Score ? `${team2Score.runs}/${team2Score.wickets}` : "",
            status: "LIVE",
            venue: match.venue,
            matchInfo: match.status,
            currentOver: match.currentOver || "0",
            startTime: match.date
          };
        });
        
        // Broadcast live matches to all clients
        broadcastToAll({
          type: 'LIVE_MATCHES_UPDATE',
          data: liveMatches
        });
        
        console.log(`Broadcasting ${liveMatches.length} live cricket matches to clients`);
      } else {
        // Fallback to mock data if no matches are available
        const liveMatches = await storage.getLiveMatches() as unknown as AppMatch[];
        broadcastToAll({
          type: 'LIVE_MATCHES_UPDATE',
          data: liveMatches
        });
      }
      
      // Update trending players
      const trendingPlayers = await storage.getTrendingPlayers(10);
      broadcastToAll({
        type: 'TRENDING_PLAYERS_UPDATE',
        data: trendingPlayers
      });
    } catch (error) {
      console.error('Error in periodic update:', error);
    }
  }, 60000); // Update every 60 seconds to avoid API rate limits
  
  // Set up user-specific updates
  setInterval(async () => {
    // For each authenticated client, send portfolio updates
    for (const client of clients) {
      if (client.userId && client.ws.readyState === WebSocket.OPEN) {
        try {
          const portfolio = await storage.getUserPortfolioSummary(client.userId);
          const holdings = await storage.getUserHoldings(client.userId);
          
          client.ws.send(JSON.stringify({
            type: 'PORTFOLIO_UPDATE',
            data: {
              portfolio,
              holdings
            }
          }));
        } catch (error) {
          console.error(`Error sending portfolio update to user ${client.userId}:`, error);
        }
      }
    }
  }, 30000); // Update user portfolios every 30 seconds
  
  // Helper functions
  async function sendInitialPublicData(ws: WebSocket) {
    try {
      let liveMatches: AppMatch[] = [];
      
      // Try to get real cricket matches first
      try {
        const cricketMatches = await getCurrentMatches();
        
        if (cricketMatches.length > 0) {
          // Convert cricket API matches to our app format
          liveMatches = cricketMatches.map(match => {
            // Find the scores for both teams
            const team1Score = match.scores.find(s => s.team === match.teams[0]?.name);
            const team2Score = match.scores.find(s => s.team === match.teams[1]?.name);
            
            return {
              id: parseInt(match.id) || Math.floor(Math.random() * 10000),
              tournament: match.matchType,
              team1: match.teams[0]?.name || "Team 1",
              team2: match.teams[1]?.name || "Team 2",
              team1Score: team1Score ? `${team1Score.runs}/${team1Score.wickets}` : "",
              team2Score: team2Score ? `${team2Score.runs}/${team2Score.wickets}` : "",
              status: "LIVE",
              venue: match.venue,
              matchInfo: match.status,
              currentOver: match.currentOver || "0",
              startTime: match.date
            };
          });
        }
      } catch (apiError) {
        console.error('Error fetching cricket API data:', apiError);
      }
      
      // Fallback to mock data if needed
      if (liveMatches.length === 0) {
        liveMatches = await storage.getLiveMatches() as unknown as AppMatch[];
      }
      
      const trendingPlayers = await storage.getTrendingPlayers(10);
      
      ws.send(JSON.stringify({
        type: 'PUBLIC_DATA',
        data: {
          liveMatches,
          trendingPlayers
        }
      }));
    } catch (error) {
      console.error('Error sending initial public data:', error);
    }
  }
  
  function broadcastToAll(message: any) {
    const messageString = JSON.stringify(message);
    
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageString);
      }
    }
  }
}
