import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface WingoCountdownTimerProps {
  period: '30s' | '1min' | '3min' | '5min';
}

const periodToSeconds = {
  '30s': 30,
  '1min': 60,
  '3min': 180,
  '5min': 300,
};

const periodLabels = {
  '30s': '30 စက္ကန့်',
  '1min': '1 မိနစ်',
  '3min': '3 မိနစ်',
  '5min': '5 မိနစ်',
};

export const WingoCountdownTimer = ({ period }: WingoCountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(periodToSeconds[period]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    // Reset when period changes
    setSecondsLeft(periodToSeconds[period]);
  }, [period]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Round ended, start new round
          setRoundNumber(r => r + 1);
          return periodToSeconds[period];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [period]);

  useEffect(() => {
    // Check if urgent (less than 10 seconds)
    setIsUrgent(secondsLeft <= 10);
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) {
      return {
        value: `${mins}:${secs.toString().padStart(2, '0')}`,
        label: 'မိနစ်'
      };
    }
    return {
      value: secs.toString(),
      label: 'စက္ကန့်'
    };
  };

  const time = formatTime(secondsLeft);
  const progress = ((periodToSeconds[period] - secondsLeft) / periodToSeconds[period]) * 100;

  return (
    <Card className={`lottery-card overflow-hidden transition-all duration-300 ${isUrgent ? 'ring-2 ring-destructive' : ''}`}>
      <div className="bg-gradient-primary p-4 text-white text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${20 + i * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <h3 className="text-sm font-bold mb-1">⏱️ Wingo ဂိမ်းအချိန်</h3>
          <p className="text-lg font-bold">{periodLabels[period]}</p>
          <p className="text-xs opacity-80">အကြိမ် #{roundNumber}</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-background to-muted/20">
        {/* Countdown Display */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`
              relative w-32 h-32 rounded-full flex flex-col items-center justify-center
              ${isUrgent 
                ? 'bg-gradient-to-br from-destructive/20 to-orange-500/20 border-4 border-destructive animate-pulse' 
                : 'bg-gradient-to-br from-primary/10 to-secondary/20 border-4 border-primary/30'
              }
              shadow-xl transition-all duration-300
            `}
          >
            {/* Glow effect */}
            {isUrgent && (
              <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl animate-pulse" />
            )}
            
            <span 
              className={`
                relative z-10 text-5xl font-bold font-mono
                ${isUrgent ? 'text-destructive' : 'text-primary'}
              `}
            >
              {time.value}
            </span>
            <span className={`relative z-10 text-sm mt-1 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
              {time.label}
            </span>
          </div>
        </div>

        {/* Urgent Warning */}
        {isUrgent && (
          <div className="mt-4 text-center animate-bounce">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-bold">
              🔥 အမြန်ထိုးပါ!
            </span>
          </div>
        )}

        {/* Circular Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                isUrgent 
                  ? 'bg-gradient-to-r from-destructive to-orange-500 animate-pulse' 
                  : 'bg-gradient-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Game Status */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {secondsLeft > 10 ? '🎰 ထိုးနိုင်သည်' : '⏱️ ပိတ်တော့မည်'}
          </p>
        </div>
      </div>
    </Card>
  );
};
