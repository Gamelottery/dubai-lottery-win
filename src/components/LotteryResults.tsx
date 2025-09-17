import { Card } from "@/components/ui/card";

interface LotteryResultsProps {
  results: {
    morning: string | null;
    afternoon: string | null;
    evening: string | null;
  };
  nextDrawTime: string;
}

export const LotteryResults = ({ results, nextDrawTime }: LotteryResultsProps) => {
  const draws = [
    {
      time: "🌅 မနက် 9:30",
      timeEn: "Morning Draw",
      result: results.morning,
      bgColor: "bg-secondary/20",
      textColor: "text-secondary",
    },
    {
      time: "☀️ နေ့လည် 2:00", 
      timeEn: "Afternoon Draw",
      result: results.afternoon,
      bgColor: "bg-accent/20",
      textColor: "text-accent",
    },
    {
      time: "🌆 ညနေ 4:30",
      timeEn: "Evening Draw", 
      result: results.evening,
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
        </div>
      </Card>
    </div>
  );
};