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

    const draw11am = todayResults.find(r => r.draw_time.includes('11:00') || r.draw_time.toLowerCase().includes('11:00 am'));
    const draw1pm = todayResults.find(r => r.draw_time.includes('1:00') || r.draw_time.toLowerCase().includes('1:00 pm'));
    const draw3pm = todayResults.find(r => r.draw_time.includes('3:00') || r.draw_time.toLowerCase().includes('3:00 pm'));
    const draw5pm = todayResults.find(r => r.draw_time.includes('5:00') || r.draw_time.toLowerCase().includes('5:00 pm'));
    const draw7pm = todayResults.find(r => r.draw_time.includes('7:00') || r.draw_time.toLowerCase().includes('7:00 pm'));
    const draw9pm = todayResults.find(r => r.draw_time.includes('9:00') || r.draw_time.toLowerCase().includes('9:00 pm'));

    return {
      draw11am: draw11am?.result_number || null,
      draw1pm: draw1pm?.result_number || null,
      draw3pm: draw3pm?.result_number || null,
      draw5pm: draw5pm?.result_number || null,
      draw7pm: draw7pm?.result_number || null,
      draw9pm: draw9pm?.result_number || null,
    };
  };

  const todayResults = getLatestResultsByTime();

  const draws = [
    {
      time: "11:00 AM",
      timeEn: "11:00 AM Draw",
      result: todayResults.draw11am,
      bgColor: "bg-secondary/20",
      textColor: "text-secondary",
    },
    {
      time: "1:00 PM", 
      timeEn: "1:00 PM Draw",
      result: todayResults.draw1pm,
      bgColor: "bg-accent/20",
      textColor: "text-accent",
    },
    {
      time: "3:00 PM",
      timeEn: "3:00 PM Draw", 
      result: todayResults.draw3pm,
      bgColor: "bg-primary/20",
      textColor: "text-primary",
    },
    {
      time: "5:00 PM",
      timeEn: "5:00 PM Draw", 
      result: todayResults.draw5pm,
      bgColor: "bg-secondary/20",
      textColor: "text-secondary",
    },
    {
      time: "7:00 PM",
      timeEn: "7:00 PM Draw", 
      result: todayResults.draw7pm,
      bgColor: "bg-accent/20",
      textColor: "text-accent",
    },
    {
      time: "9:00 PM",
      timeEn: "9:00 PM Draw", 
      result: todayResults.draw9pm,
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
        
        <div className="p-4 md:p-8">
          {/* Horizontal scrolling layout for mobile */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {draws.map((draw, index) => (
              <div key={index} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center">
                <div className={`${draw.bgColor} rounded-2xl p-4 sm:p-6 lottery-hover h-full`}>
                  <div className={`text-lg sm:text-xl font-bold ${draw.textColor} mb-3 sm:mb-4 text-center`}>
                    {draw.time}
                  </div>
                  <div className="bg-card-light rounded-xl p-4 sm:p-6 shadow-inner">
                    {draw.result ? (
                      <div className="lottery-number text-3xl sm:text-4xl font-black animate-lottery-glow text-center">
                        {draw.result}
                      </div>
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold text-muted-foreground animate-lottery-pulse text-center">
                        မထွက်သေး
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
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
            <div className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 text-primary">
                📊 လတ်တလော ရလဒ်များ
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {lotteryResults.slice(0, 6).map((result) => (
                  <Card key={result.id} className="flex-shrink-0 w-[140px] sm:w-[160px] p-3 sm:p-4 text-center snap-center">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">
                      {result.draw_time}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-primary animate-lottery-glow">
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