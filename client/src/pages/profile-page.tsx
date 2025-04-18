import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/lib/websocket";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Holding } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, Gift, User, PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, Clock, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { portfolioData } = useWebSocket();

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: holdings } = useQuery<(Holding & { player: any })[]>({
    queryKey: ["/api/holdings"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="font-poppins font-bold text-primary text-xl">Profile</h1>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Summary */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-xl">{user?.fullName || user?.username}</h2>
            <p className="text-muted-foreground">@{user?.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Player since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Available Balance</p>
              </div>
              <p className="font-semibold text-lg">₹{portfolioData?.balance.toLocaleString() || "0"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
              </div>
              <p className="font-semibold text-lg">₹{portfolioData?.portfolioValue.toLocaleString() || "0"}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Money to Wallet
          </Button>
        </div>
        
        <div className="flex items-center mt-6 gap-4">
          <Button variant="outline" className="flex-1 justify-start">
            <User className="h-4 w-4 mr-2" /> Account Details
          </Button>
          <Button variant="outline" className="flex-1 justify-start">
            <Gift className="h-4 w-4 mr-2" /> My Referrals
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-4 mt-2">
        <Tabs defaultValue="transactions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-4">
            <div className="space-y-3">
              {transactions?.length ? (
                transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'BUY' ? (
                              <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                            ) : (
                              <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type} {transaction.quantity} shares
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Player ID: {transaction.playerId}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(transaction.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'BUY' ? '-' : '+'}₹{transaction.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @₹{transaction.price} per share
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No transactions yet. Start trading to see your history here.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="investments" className="mt-4">
            <div className="space-y-3">
              {holdings?.length ? (
                holdings.map((holding) => (
                  <Card key={holding.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{holding.player.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {holding.player.team} • {holding.player.role}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Qty:</span> {holding.quantity}
                            </p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Avg:</span> ₹{holding.averageBuyPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{holding.currentValue.toLocaleString()}</p>
                          <p className={`text-sm ${
                            holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {holding.profitLoss >= 0 ? '+' : ''}
                            {holding.profitLoss.toFixed(2)} ({holding.profitLossPercentage.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No investments yet. Buy player stocks to see them here.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Referral Section */}
      <div className="p-4 mt-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Referral Rewards</h3>
                <p className="text-sm text-muted-foreground">Invite friends and earn ₹500 each</p>
              </div>
            </div>
            <Separator className="mb-4" />
            <p className="text-sm mb-2">Your referral code:</p>
            <div className="flex">
              <Button variant="outline" className="flex-1 rounded-r-none border-r-0 bg-muted/30">
                {user?.referralCode || "SIXER123"}
              </Button>
              <Button className="rounded-l-none">Copy</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="profile" />
    </div>
  );
}
