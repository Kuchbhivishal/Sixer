import { Match } from "@shared/schema";
import MatchCard from "@/components/ui/match-card";

interface LiveMatchesProps {
  matches: Match[];
}

export default function LiveMatches({ matches }: LiveMatchesProps) {
  return (
    <section className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins text-lg font-semibold text-foreground">Live Matches</h2>
        <a href="#" className="text-primary text-sm font-medium">View All</a>
      </div>
      
      {matches.length > 0 ? (
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-3 min-w-max">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-muted text-center">
          <p className="text-muted-foreground">No live matches at the moment</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later for live match updates</p>
        </div>
      )}
    </section>
  );
}
