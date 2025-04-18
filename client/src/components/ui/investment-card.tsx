import { Holding, Player } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface InvestmentCardProps {
  holding: Holding & { player: Player };
  onTrade: () => void;
}

export default function InvestmentCard({ holding, onTrade }: InvestmentCardProps) {
  const isPositive = holding.profitLoss >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-muted">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-muted/50 overflow-hidden">
            {holding.player.imageUrl ? (
              <img 
                src={holding.player.imageUrl} 
                alt={holding.player.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                {holding.player.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-muted">
            {holding.player.teamImageUrl ? (
              <img 
                src={holding.player.teamImageUrl} 
                alt={holding.player.team} 
                className="w-4 h-4 object-contain" 
              />
            ) : (
              <div className="w-4 h-4 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="text-[8px] text-primary font-bold">{holding.player.team.substring(0, 2)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-foreground">{holding.player.name}</h3>
            <p className="text-sm font-medium">{holding.quantity} shares</p>
          </div>
          <div className="flex justify-between mt-0.5">
            <p className="text-sm text-muted-foreground">Avg buy: ₹{holding.averageBuyPrice.toFixed(2)}</p>
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`ri-arrow-${isPositive ? 'up' : 'down'}-line text-xs`}></i>
              <span className="text-sm font-medium">{Math.abs(holding.profitLossPercentage).toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-sm text-muted-foreground">Current: ₹{(holding.currentValue / holding.quantity).toFixed(2)}</p>
            <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}₹{holding.profitLoss.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            size="sm" 
            className={`p-1.5 rounded-lg ${isPositive ? 'bg-green-600' : 'bg-red-600'} text-white text-sm w-16 text-center h-auto`}
            onClick={onTrade}
          >
            Sell
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="p-1.5 rounded-lg bg-primary/10 text-primary text-sm w-16 text-center h-auto"
            onClick={onTrade}
          >
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}
