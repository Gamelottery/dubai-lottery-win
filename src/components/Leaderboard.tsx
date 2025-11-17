import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";

interface WinnerData {
  name: string;
  totalWinnings: number;
  winCount: number;
}

interface BiggestPayout {
  name: string;
  amount: number;
  number: string;
}

export const Leaderboard = () => {
  const [topWinners, setTopWinners] = useState<WinnerData[]>([]);
  const [biggestPayouts, setBiggestPayouts] = useState<BiggestPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bets',
          filter: 'status=eq.won'
        },
        () => {
          fetchLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: bets, error } = await supabase
        .from('bets')
        .select(`
          winning_amount,
          number,
          user_id,
          created_at,
          profiles!inner(name)
        `)
        .eq('status', 'won')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      if (bets) {
        // Calculate top winners
        const winnerMap = new Map<string, WinnerData>();
        
        bets.forEach((bet: any) => {
          const name = bet.profiles.name;
          const existing = winnerMap.get(name) || { name, totalWinnings: 0, winCount: 0 };
          existing.totalWinnings += Number(bet.winning_amount || 0);
          existing.winCount += 1;
          winnerMap.set(name, existing);
        });

        const winners = Array.from(winnerMap.values())
          .sort((a, b) => b.totalWinnings - a.totalWinnings)
          .slice(0, 5);

        setTopWinners(winners);

        // Get biggest single payouts
        const payouts = bets
          .map((bet: any) => ({
            name: bet.profiles.name,
            amount: Number(bet.winning_amount || 0),
            number: bet.number
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        setBiggestPayouts(payouts);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-background via-background to-dubai-brown/20">
        <div className="text-center text-muted-foreground">Loading leaderboard...</div>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Winners */}
      <Card className="p-6 bg-gradient-to-br from-background via-background to-dubai-brown/20 border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary animate-sparkle" />
          <h2 className="text-2xl font-bold text-primary">Top Winners Today</h2>
        </div>
        
        <div className="space-y-4">
          {topWinners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No winners yet today</p>
          ) : (
            topWinners.map((winner, index) => (
              <div
                key={winner.name}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground animate-gold-glow' :
                    index === 1 ? 'bg-dubai-teal/20 text-dubai-teal' :
                    index === 2 ? 'bg-dubai-brown/30 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{winner.name}</p>
                    <p className="text-sm text-muted-foreground">{winner.winCount} wins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {winner.totalWinnings.toLocaleString()} MMK
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Biggest Payouts */}
      <Card className="p-6 bg-gradient-to-br from-background via-background to-dubai-brown/20 border-dubai-teal/20">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-dubai-teal animate-sparkle" />
          <h2 className="text-2xl font-bold text-dubai-teal">Biggest Payouts</h2>
        </div>
        
        <div className="space-y-4">
          {biggestPayouts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No payouts yet today</p>
          ) : (
            biggestPayouts.map((payout, index) => (
              <div
                key={`${payout.name}-${payout.number}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-dubai-teal/5 to-transparent border border-dubai-teal/10 hover:border-dubai-teal/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-dubai-teal to-dubai-teal/60 text-white animate-gold-glow' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{payout.name}</p>
                    <p className="text-sm text-muted-foreground">Number: {payout.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-dubai-teal">
                    {payout.amount.toLocaleString()} MMK
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
