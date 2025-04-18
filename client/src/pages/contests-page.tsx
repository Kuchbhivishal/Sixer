import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, ChevronRight, TrendingUp } from "lucide-react";

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  // In a real app, these would come from an API
  const upcomingContests = [
    {
      id: 1,
      name: "IPL Weekly Challenge",
      entryFee: 500,
      prize: 25000,
      participants: 120,
      totalSpots: 200,
      endsIn: "2 days",
    },
    {
      id: 2,
      name: "T20 World Cup Prediction",
      entryFee: 1000,
      prize: 100000,
      participants: 350,
      totalSpots: 500,
      endsIn: "5 days",
    },
    {
      id: 3,
      name: "Daily Trading Challenge",
      entryFee: 100,
      prize: 5000,
      participants: 75,
      totalSpots: 100,
      endsIn: "12 hours",
    }
  ];

  const liveContests = [
    {
      id: 4,
      name: "IPL Trading Cup",
      participants: 180,
      totalSpots: 200,
      yourRank: 45,
      timeLeft: "3 hours",
    }
  ];

  const completedContests = [
    {
      id: 5,
      name: "Last Week's Challenge",
      participants: 198,
      yourRank: 12,
      prize: 20000,
      yourWinnings: 1200,
    },
    {
      id: 6,
      name: "Monthly Mega Contest",
      participants: 450,
      yourRank: 78,
      prize: 150000,
      yourWinnings: 0,
    }
  ];

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="font-poppins font-bold text-primary text-xl">Contests</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4">
            <div className="space-y-4">
              {upcomingContests.map(contest => (
                <Card key={contest.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{contest.name}</h3>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        Ends in {contest.endsIn}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Trophy className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Prize Pool</p>
                          <p className="font-semibold">₹{contest.prize.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Users className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Participants</p>
                          <p className="font-semibold">{contest.participants}/{contest.totalSpots}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Entry Fee</p>
                          <p className="font-semibold">₹{contest.entryFee}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {contest.totalSpots - contest.participants} spots left
                      </p>
                      <Button size="sm">
                        Join Contest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {upcomingContests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming contests available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="live" className="mt-4">
            <div className="space-y-4">
              {liveContests.map(contest => (
                <Card key={contest.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{contest.name}</h3>
                      <div className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs flex items-center gap-1">
                        <span className="w-2 h-2 bg-destructive rounded-full"></span>
                        Live
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Users className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Participants</p>
                          <p className="font-semibold">{contest.participants}/{contest.totalSpots}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <TrendingUp className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Your Rank</p>
                          <p className="font-semibold">{contest.yourRank}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Time Left</p>
                          <p className="font-semibold">{contest.timeLeft}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      View Leaderboard <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {liveContests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No live contests at the moment
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="space-y-4">
              {completedContests.map(contest => (
                <Card key={contest.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{contest.name}</h3>
                      <div className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                        Completed
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Trophy className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Prize Pool</p>
                          <p className="font-semibold">₹{contest.prize.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <Users className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Participants</p>
                          <p className="font-semibold">{contest.participants}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <TrendingUp className="h-4 w-4 text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Your Rank</p>
                          <p className="font-semibold">{contest.yourRank}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm">
                        Your Winnings: 
                        <span className={contest.yourWinnings > 0 ? "text-green-600 font-semibold ml-1" : "text-muted-foreground ml-1"}>
                          {contest.yourWinnings > 0 ? `₹${contest.yourWinnings}` : 'None'}
                        </span>
                      </p>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {completedContests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed contests found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="contests" />
    </div>
  );
}
