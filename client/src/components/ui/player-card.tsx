import { Player } from "@shared/schema";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: Player;
  onTrade: () => void;
}

export default function PlayerCard({ player, onTrade }: PlayerCardProps) {
  const isPositive = player.priceChangePercentage >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-muted">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-muted/50 overflow-hidden">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                {player.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-muted">
            {player.teamImageUrl ? (
              <img 
                src={player.teamImageUrl} 
                alt={player.team} 
                className="w-4 h-4 object-contain" 
              />
            ) : (
              <div className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="text-[8px] text-primary font-bold">{player.team.substring(0, 2)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-foreground">{player.name}</h3>
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`ri-arrow-${isPositive ? 'up' : 'down'}-line text-xs`}></i>
              <span className="text-sm font-medium">{Math.abs(player.priceChangePercentage).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-0.5">
            <p className="text-sm text-muted-foreground">{player.role}</p>
            <p className="text-sm font-medium">₹{player.currentPrice}</p>
          </div>
          <div className="mt-2 h-1 w-full bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isPositive ? 'bg-green-600' : 'bg-red-600'}`} 
              style={{ width: `${Math.min(Math.abs(player.priceChangePercentage) * 5, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <Button 
            size="icon" 
            className="p-2 rounded-lg" 
            onClick={onTrade}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
