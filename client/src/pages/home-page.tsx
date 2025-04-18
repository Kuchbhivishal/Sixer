import { useState } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import PortfolioSummary from "@/components/portfolio-summary";
import LiveMatches from "@/components/live-matches";
import TrendingPlayers from "@/components/trending-players";
import YourInvestments from "@/components/your-investments";
import PlayerTradingModal from "@/components/player-trading-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Player } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const { isLoading, liveMatches, trendingPlayers, portfolioData, holdings } = useWebSocket();
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const openTradingModal = (player: Player) => {
    setSelectedPlayer(player);
    setTradingModalOpen(true);
  };

  const closeTradingModal = () => {
    setTradingModalOpen(false);
    setSelectedPlayer(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="font-poppins font-bold text-primary text-xl">SixerGame</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative">
                <i className="ri-notification-3-line text-2xl text-foreground"></i>
                <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.username?.substring(0, 2).toUpperCase() || "U"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Portfolio Summary */}
        <PortfolioSummary portfolioData={portfolioData} />

        {/* Live Matches */}
        <LiveMatches matches={liveMatches} />

        {/* Trending Players */}
        <TrendingPlayers players={trendingPlayers} onTrade={openTradingModal} />

        {/* Your Investments */}
        <YourInvestments holdings={holdings} onTrade={openTradingModal} />
      </main>

      {/* Trading Modal */}
      {selectedPlayer && (
        <PlayerTradingModal 
          isOpen={tradingModalOpen} 
          onClose={closeTradingModal} 
          player={selectedPlayer}
          userBalance={portfolioData?.balance || 0}
          userHolding={holdings.find(h => h.playerId === selectedPlayer.id)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="home" />
    </div>
  );
}
