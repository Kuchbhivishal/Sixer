import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/lib/websocket";
import { Player } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import PlayerTradingModal from "@/components/player-trading-modal";
import BottomNavigation from "@/components/bottom-navigation";
import PlayerCard from "@/components/ui/player-card";

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { portfolioData, holdings, isLoading: wsLoading } = useWebSocket();

  const { data: allPlayers, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const openTradingModal = (player: Player) => {
    setSelectedPlayer(player);
    setTradingModalOpen(true);
  };

  const closeTradingModal = () => {
    setTradingModalOpen(false);
    setSelectedPlayer(null);
  };

  const filteredPlayers = allPlayers?.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const battingPlayers = filteredPlayers?.filter(player => player.role.includes("Batsman"));
  const bowlingPlayers = filteredPlayers?.filter(player => player.role.includes("Bowler"));
  const allRounders = filteredPlayers?.filter(player => player.role.includes("All-rounder"));

  const isLoading = playersLoading || wsLoading;

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
              <h1 className="font-poppins font-bold text-primary text-xl">Market</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players, teams, roles..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Player Categories */}
      <div className="p-4">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="batsmen">Batsmen</TabsTrigger>
            <TabsTrigger value="bowlers">Bowlers</TabsTrigger>
            <TabsTrigger value="all-rounders">All Rounders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {filteredPlayers?.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  onTrade={() => openTradingModal(player)} 
                />
              ))}
              {filteredPlayers?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No players found matching your search
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="batsmen" className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {battingPlayers?.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  onTrade={() => openTradingModal(player)} 
                />
              ))}
              {battingPlayers?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No batsmen found matching your search
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bowlers" className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {bowlingPlayers?.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  onTrade={() => openTradingModal(player)} 
                />
              ))}
              {bowlingPlayers?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No bowlers found matching your search
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all-rounders" className="mt-4">
            <div className="grid grid-cols-1 gap-3">
              {allRounders?.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  onTrade={() => openTradingModal(player)} 
                />
              ))}
              {allRounders?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No all-rounders found matching your search
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
      <BottomNavigation currentPage="market" />
    </div>
  );
}
