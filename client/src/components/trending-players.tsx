import { Player } from "@shared/schema";
import PlayerCard from "@/components/ui/player-card";
import { Button } from "@/components/ui/button";

interface TrendingPlayersProps {
  players: Player[];
  onTrade: (player: Player) => void;
}

export default function TrendingPlayers({ players, onTrade }: TrendingPlayersProps) {
  const topThreePlayers = players.slice(0, 3);

  return (
    <section className="px-4 py-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins text-lg font-semibold text-foreground">Trending Players</h2>
        <a href="#" className="text-primary text-sm font-medium">View All</a>
      </div>
      
      {topThreePlayers.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 mb-6">
          {topThreePlayers.map(player => (
            <PlayerCard key={player.id} player={player} onTrade={() => onTrade(player)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-muted text-center mb-6">
          <p className="text-muted-foreground">No trending players available</p>
          <Button className="mt-4" onClick={() => window.location.href = "/market"}>
            Explore Market
          </Button>
        </div>
      )}
    </section>
  );
}
