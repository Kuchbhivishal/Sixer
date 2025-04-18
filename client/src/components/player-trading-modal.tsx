import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Player, Holding } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Chart from "@/components/ui/chart";
import { X, Plus, Minus } from "lucide-react";

interface PlayerTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  userBalance: number;
  userHolding?: Holding;
}

interface TradeAction {
  playerId: number;
  type: 'BUY' | 'SELL';
  quantity: number;
}

export default function PlayerTradingModal({ 
  isOpen, 
  onClose, 
  player, 
  userBalance,
  userHolding
}: PlayerTradingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const { toast } = useToast();
  
  // Calculate player stats from the player.stats JSON
  const playerStats = player.stats ? (typeof player.stats === 'string' ? 
    JSON.parse(player.stats as string) : player.stats) : {};
  
  // Generate mock chart data for 7-day price movement
  const chartData = [
    { name: "Mon", value: player.currentPrice * 0.95 },
    { name: "Tue", value: player.currentPrice * 0.97 },
    { name: "Wed", value: player.currentPrice * 0.96 },
    { name: "Thu", value: player.currentPrice * 0.99 },
    { name: "Fri", value: player.currentPrice * 1.02 },
    { name: "Sat", value: player.currentPrice * 1.04 },
    { name: "Sun", value: player.currentPrice }
  ];
  
  const tradeMutation = useMutation({
    mutationFn: async (data: TradeAction) => {
      const res = await apiRequest("POST", "/api/trade", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: `${activeTab === 'BUY' ? 'Purchased' : 'Sold'} Successfully`,
        description: `You have ${activeTab === 'BUY' ? 'purchased' : 'sold'} ${quantity} shares of ${player.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/holdings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `${activeTab} Failed`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTrade = () => {
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please select at least 1 share to trade",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'BUY' && quantity * player.currentPrice > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transaction",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'SELL' && (!userHolding || userHolding.quantity < quantity)) {
      toast({
        title: "Insufficient Holdings",
        description: "You don't have enough shares to sell",
        variant: "destructive",
      });
      return;
    }

    tradeMutation.mutate({
      playerId: player.id,
      type: activeTab,
      quantity,
    });
  };

  const increaseQuantity = () => {
    if (activeTab === 'BUY' && (quantity + 1) * player.currentPrice > userBalance) {
      toast({
        title: "Maximum Limit Reached",
        description: "You don't have enough balance to buy more shares",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'SELL' && userHolding && quantity + 1 > userHolding.quantity) {
      toast({
        title: "Maximum Limit Reached",
        description: "You don't have enough shares to sell",
        variant: "destructive",
      });
      return;
    }

    setQuantity(q => q + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const totalValue = quantity * player.currentPrice;
  const isPositive = player.priceChangePercentage >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto rounded-t-xl sm:rounded-xl p-0">
        <DialogHeader className="p-4 sticky top-0 bg-white border-b border-muted z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-poppins font-semibold text-lg">Trade Player Stock</DialogTitle>
            <DialogClose className="text-muted-foreground">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted/50 overflow-hidden">
                {player.imageUrl ? (
                  <img 
                    src={player.imageUrl} 
                    alt={player.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg">
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
            
            <div>
              <h3 className="font-medium text-lg">{player.name}</h3>
              <p className="text-muted-foreground">{player.role} • {player.team}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <i className={`ri-arrow-${isPositive ? 'up' : 'down'}-line text-xs`}></i>
                  <span className="text-sm font-medium">{Math.abs(player.priceChangePercentage).toFixed(1)}%</span>
                </div>
                <p className="text-sm font-medium">₹{player.currentPrice} per stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-muted rounded-lg p-3 mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-muted-foreground text-sm">7-Day Price Movement</p>
              <p className={`font-medium text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}₹{player.priceChange.toFixed(2)}
              </p>
            </div>
            <div className="h-20 w-full">
              <Chart 
                data={chartData} 
                color={isPositive ? "#43A047" : "#E53935"} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-muted-foreground text-sm mb-1">Current Holdings</p>
              <p className="font-semibold">{userHolding?.quantity || 0} stocks</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-muted-foreground text-sm mb-1">Available Cash</p>
              <p className="font-semibold">₹{userBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <Button 
                className={`flex-1 ${activeTab === 'BUY' ? '' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                variant={activeTab === 'BUY' ? 'default' : 'outline'}
                onClick={() => setActiveTab('BUY')}
              >
                Buy Stocks
              </Button>
              <Button 
                className={`flex-1 ${activeTab === 'SELL' ? '' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                variant={activeTab === 'SELL' ? 'default' : 'outline'}
                onClick={() => setActiveTab('SELL')}
              >
                Sell Stocks
              </Button>
            </div>
            
            <label className="block font-medium mb-2">Number of Stocks</label>
            <div className="flex border border-muted rounded-lg overflow-hidden">
              <Button 
                type="button" 
                variant="ghost" 
                className="px-4 py-2 bg-muted/30 text-foreground rounded-none h-auto" 
                onClick={decreaseQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                className="flex-1 text-center py-2 border-none focus:outline-none" 
                min="1"
              />
              <Button 
                type="button" 
                variant="ghost" 
                className="px-4 py-2 bg-muted/30 text-foreground rounded-none h-auto" 
                onClick={increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Player Stats</h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(playerStats).slice(0, 6).map(([key, value], index) => (
                <div key={index} className="p-2 border border-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{key}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 py-3 border-primary text-primary font-medium"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 py-3 font-medium"
              onClick={handleTrade}
              disabled={tradeMutation.isPending}
            >
              {tradeMutation.isPending ? 
                `${activeTab === 'BUY' ? 'Buying' : 'Selling'}...` : 
                `${activeTab} Now`
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
