import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface CountdownTimerProps {
  nextDrawTime: string;
}

const drawTimes = [
  { label: "11:00 AM", hour: 11, minute: 0 },
  { label: "1:00 PM", hour: 13, minute: 0 },
  { label: "3:00 PM", hour: 15, minute: 0 },
  { label: "5:00 PM", hour: 17, minute: 0 },
  { label: "7:00 PM", hour: 19, minute: 0 },
  { label: "9:00 PM", hour: 21, minute: 0 },
];

export const CountdownTimer = ({ nextDrawTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Create audio element for notification
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleS0RPZL/56NwJwUynu3/0ppVEQ8/sf/9s3U0E0CV///gmVgOJavH/+OPQh0ypu7/4JxLHzOi6P/glEodPKfn/+CVTBtBru7/3JJKIESr5P/fkUofR7Hm/9yOSR9JtOb/24xIH0a05v/ajEofRrPn/9qNSB9FtOf/2o1IH0a05//ajkgfRbTn/9qNSB9FtOb/241JH0Sz5v/bjUgfRLPm/9uNSR9EtOb/3I5JHkSz5//cjUkeRLPn/9yOSR5Es+f/3I1JHkOz5//djUkeQ7Pm/92NSR5Dsub/3Y5JHkOy5v/djkkeQ7Lm/92OSR5Dsub/3Y5JHkKy5v/djkkeQrLm/92OSR5Csub/3Y5JHkKy5v/ejkgeQrLm/96OSB5Bsub/3o5IHkGx5v/ejkgeQbHm/96PSB5Bseb/349IHkCx5v/fj0geQLHm/9+PSB5Aseb/35BIHkCx5v/gkEgeP7Hm/+CQSB4/seb/4JBIH0Cx5v/gkEgfP7Hm/+GQSB8/sOb/4ZBIH0Cw5v/hkUgfP7Dm/+GRSB8/sOb/4pFIHz+w5v/ikUgfP7Dm/+KSSB8+sOb/4pJIHz6v5v/ikkgfPq/m/+KSSB8+r+b/45JIHz6v5v/jkkgfPq/m/+OTSB89r+b/45NIHz2v5v/jk0gfPa/m/+STSB89r+b/5JNIHzyv5v/kk0gfPK/m/+SUSB88r+b/5JRIHzyu5v/llEgfPK7m/+WUSB88rub/5ZRIHzuu5v/llEgfO67m/+aUSB87rub/5pVIHzuu5v/mlUgfO67m/+aVSB86rub/5pVIHzqu5v/nlUgfOq7m/+eVSB86rub/55ZIHzmt5v/nlkgfOa3m/+eWSB85reb/6JZIH0Ct5v/olkgfQK3m/+iWSB9Areb/6JdIH0Cs5v/ol0gfQKzm/+iXSB9ArOb/6ZdIH0Cs5v/pl0gfP6zm/+mXSB8/rOb/6ZhIHz+s5v/pmEgfP6zm/+qYSB8+rOb/6phIHz6s5v/qmEgfPqzm/+qYSB8+q+b/6phIHj6r5v/rmEgePqvm/+uZSB4+q+b/65lIHj6r5v/rmUgePavm/+yZSB49q+b/7JlIHj2r5v/smUgePavm/+yZSB49q+b/7JpIHjyr5v/smkgePKvm/+2aSB48q+b/7ZpIHjyr5v/tmkgePKrm/+2aSB48qub/7ZpIHTyq5v/umkgdPKrm/+6bSB08qub/7ptIHTyq5v/um0gdO6rm/++bSB07qub/75tIHTuq5v/vm0gdO6rm/++bSB07qub/75xIHTuq5v/vnEgdOqrm//CcSB06qub/8JxIHTqq5v/wnEgdOqrm//CcSB06qeb/8JxIHTmp5v/xnEgdOanm//GdSB05qeb/8Z1IHTmp5v/xnUgdOanm//GdSB05qeb/8Z1IHTmp5v/xnUgdOKnm//KdSB04qeb/8p1IHTio5v/ynkgdOKjm//KeSB04qOb/8p5IHTio5v/ynkgdOKjm//KeSB03qOb/855IHTeo5v/zn0gdN6jm//OfSB03qOb/859IHTeo5v/zn0gdN6fm//OfSB03p+b/9J9IHTan5v/0n0gdNqfm//SfSB02p+b/9KBIHTan5v/0oEgdNqfm//SgSB02p+b/9aBIHDan5v/1oEgcNqfm//WgSBw2p+b/9aBIHDam5v/1oUgcNqbm//WhSBw2pub/9aFIHDam5v/2oUgcNabm//ahSBw1pub/9qFIHDWm5v/2okgcNabm//aiSBw1pub/9qJIHDWm5v/2okgcNabm//eiSBw0pub/96JIHDSm5v/3okgcNKXm//eiSBw0peb/96NIHDSl5v/3o0gcNKXm//ejSBw0peb/+KNIGzSl5v/4o0gbNKXm//ijSBs0peb/+KRIGzSl5v/4pEgbNKXm//ikSBs0peb/+KRIGzOl5v/5pEgbM6Xm//mkSBszpeb/+aRIGzOl5v/5pUgbM6Xm//mlSBszpeb/+aVIGzOl5v/5pUgbM6Tm//qlSBszpOb/+qVIGzOk5v/6pUgbM6Tm//qlSBsypOb/+qZIGzKk5v/6pkgbMqTm//qmSBsypOb/+6ZIGzKk5v/7pkgbMqTm//umSBsypOb/+6ZIGzKk5v/7p0gbMaTm//unSBsxpOb/+6dIGzGk5v/7p0gbMaTm//ynSBsxpOb//KdIGzGk5v/8p0gbMaTm//ynSBsxo+b//KhIGzGj5v/8qEgbMaPm//yoSBsxo+b//KhIGjGj5v/9qEgaMaPm//2oSBoxo+b//ahIGjGj5v/9qEgaMaPm//2oSBoxo+b//alIGjCj5v/9qUgaMKPm//6pSBowo+b//qlIGjCj5v/+qUgaMKPm//6pSBowo+b//qlIGjCj5v/+qkgaMKPm//+qSBowouYAAKpIGjCi5gAAqkgaMKLmAACqSBowouYAAKpIGjCi5gAAqkgaMKLmAACqSBowouYAAKtIGjCi5gAAq0gaMKLmAACrSBovouYAAKtIGi+i5gAArEgaL6LmAACsSBovouYAAKxIGi+i5gAArEgaL6LmAACsSBovouYAAKxIGi+i5gAArUgaL6HmAACt');
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Find next draw time
      let nextDraw = drawTimes.find(dt => {
        if (dt.hour > currentHour) return true;
        if (dt.hour === currentHour && dt.minute > currentMinute) return true;
        return false;
      });

      // If no draw time found today, use first draw time tomorrow
      if (!nextDraw) {
        nextDraw = drawTimes[0];
      }

      const targetDate = new Date();
      targetDate.setHours(nextDraw.hour, nextDraw.minute, 0, 0);
      
      // If the target is in the past, add a day
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
      
      // Check if urgent (less than 5 minutes)
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      setIsUrgent(totalSeconds < 300);

      // Play sound when reaching 0
      if (totalSeconds <= 1 && !hasPlayedRef.current) {
        hasPlayedRef.current = true;
        playNotification();
        setShowFlash(true);
        setTimeout(() => {
          setShowFlash(false);
          hasPlayedRef.current = false;
        }, 3000);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(console.error);
    }
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <Card className={`lottery-card overflow-hidden transition-all duration-500 ${showFlash ? 'animate-pulse ring-4 ring-primary' : ''}`}>
      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 bg-gradient-primary opacity-30 animate-pulse z-10" />
      )}
      
      <div className="bg-gradient-primary p-4 text-white text-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-1">⏰ နောက်ထီဖွင့်ချိန်</h3>
          <p className="text-2xl font-bold animate-sparkle">{nextDrawTime}</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-background to-muted/20">
        {/* Countdown Display */}
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <TimeBlock value={formatNumber(timeLeft.hours)} label="နာရီ" isUrgent={isUrgent} />
          <div className={`text-3xl font-bold ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'}`}>:</div>
          <TimeBlock value={formatNumber(timeLeft.minutes)} label="မိနစ်" isUrgent={isUrgent} />
          <div className={`text-3xl font-bold ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'}`}>:</div>
          <TimeBlock value={formatNumber(timeLeft.seconds)} label="စက္ကန့်" isUrgent={isUrgent} pulse />
        </div>

        {/* Urgent Warning */}
        {isUrgent && (
          <div className="mt-4 text-center animate-bounce">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-bold">
              🔥 အမြန်ထိုးပါ! အချိန်နည်းနေပြီ!
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                isUrgent 
                  ? 'bg-gradient-to-r from-destructive to-orange-500 animate-pulse' 
                  : 'bg-gradient-primary'
              }`}
              style={{
                width: `${Math.max(5, 100 - ((timeLeft.hours * 60 + timeLeft.minutes) / 120) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Draw Times Schedule */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {drawTimes.map((dt) => (
            <span
              key={dt.label}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                nextDrawTime === dt.label 
                  ? 'bg-primary text-primary-foreground font-bold scale-110' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {dt.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

const TimeBlock = ({ 
  value, 
  label, 
  isUrgent, 
  pulse 
}: { 
  value: string; 
  label: string; 
  isUrgent: boolean;
  pulse?: boolean;
}) => (
  <div className="text-center">
    <div 
      className={`
        relative w-16 sm:w-20 h-16 sm:h-20 rounded-xl flex items-center justify-center
        ${isUrgent 
          ? 'bg-gradient-to-br from-destructive/20 to-orange-500/20 border-2 border-destructive' 
          : 'bg-gradient-to-br from-primary/10 to-secondary/20 border-2 border-primary/30'
        }
        ${pulse ? 'animate-pulse' : ''}
        shadow-lg
      `}
    >
      {/* Glow effect */}
      {isUrgent && (
        <div className="absolute inset-0 rounded-xl bg-destructive/20 blur-md animate-pulse" />
      )}
      
      <span 
        className={`
          relative z-10 text-3xl sm:text-4xl font-bold font-mono
          ${isUrgent ? 'text-destructive' : 'text-primary'}
        `}
      >
        {value}
      </span>
    </div>
    <span className={`text-xs mt-1 block ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
);
