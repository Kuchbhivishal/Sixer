import React, { createContext, ReactNode, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Player, Match, Holding } from "@shared/schema";

interface PortfolioData {
  portfolioValue: number;
  balance: number;
  growth: number;
  growthPercentage: number;
}

interface WebSocketContextType {
  connected: boolean;
  liveMatches: Match[];
  trendingPlayers: Player[];
  portfolioData: PortfolioData | null;
  holdings: (Holding & { player: Player })[];
  isLoading: boolean;
}

const defaultPortfolioData: PortfolioData = {
  portfolioValue: 0,
  balance: 0,
  growth: 0,
  growthPercentage: 0
};

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  liveMatches: [],
  trendingPlayers: [],
  portfolioData: null,
  holdings: [],
  isLoading: true
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState<boolean>(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [trendingPlayers, setTrendingPlayers] = useState<Player[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [holdings, setHoldings] = useState<(Holding & { player: Player })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;
    
    socket.onopen = () => {
      setConnected(true);
      
      // Authenticate with the server
      socket.send(JSON.stringify({
        type: 'AUTH',
        data: { userId: user.id }
      }));
    };
    
    socket.onclose = () => {
      setConnected(false);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'PUBLIC_DATA':
            setLiveMatches(message.data.liveMatches || []);
            setTrendingPlayers(message.data.trendingPlayers || []);
            setIsLoading(false);
            break;
            
          case 'INITIAL_DATA':
            setLiveMatches(message.data.liveMatches || []);
            setTrendingPlayers(message.data.trendingPlayers || []);
            setPortfolioData(message.data.portfolio || defaultPortfolioData);
            setHoldings(message.data.holdings || []);
            setIsLoading(false);
            break;
            
          case 'LIVE_MATCHES_UPDATE':
            setLiveMatches(message.data || []);
            break;
            
          case 'TRENDING_PLAYERS_UPDATE':
            setTrendingPlayers(message.data || []);
            break;
            
          case 'PORTFOLIO_UPDATE':
            setPortfolioData(message.data.portfolio || defaultPortfolioData);
            setHoldings(message.data.holdings || []);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);
  
  return (
    <WebSocketContext.Provider 
      value={{
        connected,
        liveMatches,
        trendingPlayers,
        portfolioData,
        holdings,
        isLoading
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
