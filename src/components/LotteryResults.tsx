import { useState, useEffect } from "react";
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
      result: todayResults.draw11am,
    },
    {
      time: "1:00 PM", 
      result: todayResults.draw1pm,
    },
    {
      time: "3:00 PM",
      result: todayResults.draw3pm,
    },
    {
      time: "5:00 PM",
      result: todayResults.draw5pm,
    },
    {
      time: "7:00 PM",
      result: todayResults.draw7pm,
    },
    {
      time: "9:00 PM",
      result: todayResults.draw9pm,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mb-8 px-4">
      {/* Grid layout matching reference image */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {draws.map((draw, index) => (
          <div key={index} className="rounded-2xl overflow-hidden shadow-lg">
            {/* Time header - darker blue */}
            <div className="bg-[hsl(204,42%,45%)] py-4 sm:py-6">
              <div className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
                {draw.time}
              </div>
            </div>
            
            {/* Result section - lighter blue */}
            <div className="bg-[hsl(204,42%,55%)] py-8 sm:py-12 lg:py-16">
              {draw.result ? (
                <div className="text-[#FFD700] text-4xl sm:text-5xl lg:text-6xl font-black text-center">
                  {draw.result}
                </div>
              ) : (
                <div className="h-[48px] sm:h-[60px] lg:h-[72px]"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
