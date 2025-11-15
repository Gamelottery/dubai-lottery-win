import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface LotteryResult {
  id: string;
  draw_time: string;
  result_number: string;
  created_at: string;
}

export const GameHistory = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('lottery-results-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lottery_results'
        },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching results:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNumberColor = (num: string) => {
    const number = parseInt(num);
    if (isNaN(number)) return "text-foreground";
    
    if ([0, 5].includes(number)) return "text-purple-500";
    if ([1, 3, 7, 9].includes(number)) return "text-green-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6 bg-card">
      <h2 className="text-2xl font-bold mb-4 text-foreground">ထီရလဒ်သမိုင်း</h2>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">ရှာနေသည်...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          ထီရလဒ် မရှိသေးပါ
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(result.created_at), 'MMM dd, yyyy · HH:mm')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Draw: {result.draw_time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">ထွက်ဂဏန်း:</span>
                <div
                  className={`text-2xl font-bold ${getNumberColor(result.result_number)}`}
                >
                  {result.result_number}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
