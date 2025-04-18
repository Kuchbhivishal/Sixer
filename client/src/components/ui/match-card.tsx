import { Match } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  
  // Format remaining time for upcoming matches
  const formatRemainingTime = () => {
    if (!match.startTime) return "";
    
    const startTime = new Date(match.startTime);
    const now = new Date();
    const diffMs = startTime.getTime() - now.getTime();
    
    if (diffMs < 0) return "Starting soon";
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `Starting in ${diffHrs}h ${diffMins}m`;
    } else {
      return `Starting in ${diffMins}m`;
    }
  };

  return (
    <Card className="w-72 p-3 shadow-sm border border-muted">
      <div className="flex justify-between items-center mb-3">
        {isLive ? (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-500 text-xs font-medium">LIVE</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{formatRemainingTime()}</span>
        )}
        <span className="text-xs text-muted-foreground">{match.tournament}</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{match.team1}</span>
          {isLive && <span className="text-sm text-muted-foreground">{match.team1Score}</span>}
        </div>
        {isLive && (
          <Badge variant="outline" className="text-xs bg-muted/50">
            {match.currentOver} overs
          </Badge>
        )}
        {!isLive && (
          <div className="text-xs">
            vs
          </div>
        )}
        <div className="flex items-center gap-2">
          {isLive && <span className="text-sm text-muted-foreground">{match.team2Score}</span>}
          <span className="font-medium text-foreground">{match.team2}</span>
        </div>
      </div>
      
      {isLive && match.matchInfo && (
        <div className="text-sm text-muted-foreground mb-3">
          {match.matchInfo}
        </div>
      )}
      
      {isUpcoming && match.venue && (
        <div className="text-sm text-muted-foreground mb-3">
          {match.venue}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 py-1.5 bg-primary/10 text-primary">
          {isLive ? "Match Stats" : "View Players"}
        </Button>
        <Button size="sm" className="flex-1 py-1.5 text-white">
          {isLive ? "Trade Now" : "Pre-Trade"}
        </Button>
      </div>
    </Card>
  );
}
