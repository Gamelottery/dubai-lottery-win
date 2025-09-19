import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface LotteryResult {
  id: string;
  draw_time: string;
  result_number: string;
  created_at: string;
}

interface LotteryResultsProps {
  results?: {
    morning: string | null;
    afternoon: string | null;
    evening: string | null;
  };
  nextDrawTime: string;
}

export const LotteryResults = ({ nextDrawTime }: LotteryResultsProps) => {
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([]);
  useEffect(() => {
    fetchLotteryResults();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('lottery_results_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lottery_results' },
        () => {
          fetchLotteryResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLotteryResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLotteryResults(data || []);
    } catch (error) {
      console.error('Error fetching lottery results:', error);
    }
  };

  const getLatestResultsByTime = () => {
    const today = new Date().toDateString();
    const todayResults = lotteryResults.filter(result => 
      new Date(result.created_at).toDateString() === today
    );

    const morning = todayResults.find(r => r.draw_time.includes('9:30') || r.draw_time.toLowerCase().includes('morning'));
    const afternoon = todayResults.find(r => r.draw_time.includes('2:00') || r.draw_time.toLowerCase().includes('afternoon'));
    const evening = todayResults.find(r => r.draw_time.includes('4:30') || r.draw_time.toLowerCase().includes('evening'));

    return {
      morning: morning?.result_number || null,
      afternoon: afternoon?.result_number || null,
      evening: evening?.result_number || null,
    };
  };

  const todayResults = getLatestResultsByTime();

  const draws = [
    {
      time: "🌅 မနက် 9:30",
      timeEn: "Morning Draw",
      result: todayResults.morning,
      bgColor: "bg-secondary/20",
      textColor: "text-secondary",
    },
    {
      time: "☀️ နေ့လည် 2:00", 
      timeEn: "Afternoon Draw",
      result: todayResults.afternoon,
      bgColor: "bg-accent/20",
      textColor: "text-accent",
    },
    {
      time: "🌆 ညနေ 4:30",
      timeEn: "Evening Draw", 
      result: todayResults.evening,
      bgColor: "bg-primary/20",
      textColor: "text-primary",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <Card className="lottery-card rounded-2xl shadow-card overflow-hidden">
        <div className="bg-gradient-secondary p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">🏆 ယနေ့ ထီရလဒ်များ</h2>
          <p className="opacity-90 text-lg">
            {new Date().toLocaleDateString('my-MM', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {draws.map((draw, index) => (
              <div key={index} className="text-center">
                <div className={`${draw.bgColor} rounded-2xl p-6 lottery-hover`}>
                  <div className={`text-xl font-bold ${draw.textColor} mb-4`}>
                    {draw.time}
                  </div>
                  <div className="bg-card-light rounded-xl p-6 shadow-inner">
                    {draw.result ? (
                      <div className="lottery-number text-4xl font-black animate-lottery-glow">
                        {draw.result}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-muted-foreground animate-lottery-pulse">
                        မထွက်သေး
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-3">
                    {draw.timeEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Next Draw Countdown */}
          <div className="mt-8 text-center">
            <Card className="bg-warning/10 border-warning/30 rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-2">
                နောက်ထီ ထွက်ချိন်
              </div>
              <div className="text-2xl font-bold text-warning animate-lottery-pulse">
                {nextDrawTime}
              </div>
            </Card>
          </div>

          {/* Recent Results History */}
          {lotteryResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-center mb-6 text-primary">
                📊 လတ်တလော ရလဒ်များ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lotteryResults.slice(0, 6).map((result) => (
                  <Card key={result.id} className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {result.draw_time}
                    </div>
                    <div className="text-2xl font-bold text-primary animate-lottery-glow">
                      {result.result_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(result.created_at).toLocaleDateString('my-MM')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};