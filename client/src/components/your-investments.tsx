import { Holding, Player } from "@shared/schema";
import { Button } from "@/components/ui/button";
import InvestmentCard from "@/components/ui/investment-card";

interface YourInvestmentsProps {
  holdings: (Holding & { player: Player })[];
  onTrade: (player: Player) => void;
}

export default function YourInvestments({ holdings, onTrade }: YourInvestmentsProps) {
  return (
    <section className="px-4 py-3 mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins text-lg font-semibold text-foreground">Your Investments</h2>
        <a href="#" className="text-primary text-sm font-medium">View All</a>
      </div>
      
      {holdings.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {holdings.map(holding => (
            <InvestmentCard 
              key={holding.id} 
              holding={holding} 
              onTrade={() => onTrade(holding.player)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-muted text-center">
          <p className="text-muted-foreground">You don't have any investments yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start trading player stocks to build your portfolio</p>
          <Button className="mt-4" onClick={() => window.location.href = "/market"}>
            Start Trading
          </Button>
        </div>
      )}
    </section>
  );
}
