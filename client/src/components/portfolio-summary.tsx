import { Card } from "@/components/ui/card";
import Chart from "@/components/ui/chart";

interface PortfolioData {
  portfolioValue: number;
  balance: number;
  growth: number;
  growthPercentage: number;
}

interface PortfolioSummaryProps {
  portfolioData: PortfolioData | null;
}

export default function PortfolioSummary({ portfolioData }: PortfolioSummaryProps) {
  if (!portfolioData) {
    portfolioData = {
      portfolioValue: 0,
      balance: 0,
      growth: 0,
      growthPercentage: 0
    };
  }

  const isPositive = portfolioData.growthPercentage >= 0;
  const totalValue = portfolioData.portfolioValue + portfolioData.balance;

  // Generate dummy chart data (in a real app this would come from API)
  const chartData = [
    { name: "1w", value: 9500 },
    { name: "2w", value: 9800 },
    { name: "3w", value: 9200 },
    { name: "1m", value: 9900 },
    { name: "2m", value: 10500 },
    { name: "3m", value: 10800 },
    { name: "Now", value: totalValue }
  ];

  return (
    <section className="bg-white px-4 pt-4 pb-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins text-lg font-semibold text-foreground">Your Portfolio</h2>
        <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <i className={`ri-arrow-${isPositive ? 'up' : 'down'}-line`}></i>
          <span>{Math.abs(portfolioData.growthPercentage).toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-sm mb-1">Portfolio Value</p>
          <p className="font-semibold text-lg">₹{portfolioData.portfolioValue.toLocaleString()}</p>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-muted-foreground text-sm mb-1">Available Cash</p>
          <p className="font-semibold text-lg">₹{portfolioData.balance.toLocaleString()}</p>
        </div>
      </div>
      
      <Card className="p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-muted-foreground text-sm">Portfolio Growth</p>
          <p className={`font-medium text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}₹{portfolioData.growth.toLocaleString()}
          </p>
        </div>
        
        <div className="h-20 w-full mb-2">
          <Chart 
            data={chartData} 
            color={isPositive ? "#43A047" : "#E53935"} 
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1w</span>
          <span>1m</span>
          <span>3m</span>
          <span>6m</span>
          <span>1y</span>
          <span>All</span>
        </div>
      </Card>
    </section>
  );
}
