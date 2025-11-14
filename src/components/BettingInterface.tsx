import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Bet {
  id: string;
  number: string;
  amount: number;
}

interface BettingInterfaceProps {
  onPlaceBets: (bets: Bet[]) => void;
  userBalance: number;
}

export const BettingInterface = ({ onPlaceBets, userBalance }: BettingInterfaceProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(22);
  const { toast } = useToast();
  
  const baseAmount = 100;
  const multipliers = [1, 5, 10, 20, 50, 100];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleNumber = (num: number) => {
    const numStr = num.toString();
    setSelectedNumbers((prev) =>
      prev.includes(numStr) ? prev.filter((n) => n !== numStr) : [...prev, numStr]
    );
  };

  const selectColor = (color: string) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const placeBet = (type: 'big' | 'small') => {
    const bets: Bet[] = [];
    const amount = baseAmount * multiplier;

    // Big/Small bet logic
    const betNumber = type === 'big' ? '5-9' : '0-4';
    bets.push({
      id: Date.now().toString() + type,
      number: betNumber,
      amount,
    });

    // Add color bets if selected
    if (selectedColor) {
      bets.push({
        id: Date.now().toString() + selectedColor,
        number: selectedColor,
        amount,
      });
    }

    // Add individual number bets if selected
    selectedNumbers.forEach((num) => {
      bets.push({
        id: Date.now().toString() + num,
        number: num,
        amount,
      });
    });

    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    if (totalAmount > userBalance) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    onPlaceBets(bets);
    setSelectedNumbers([]);
    setSelectedColor(null);
    toast({
      title: "ထီထိုးပြီးပါပြီ",
      description: `${bets.length} ရွေးချယ်မှု - ${totalAmount.toLocaleString()} ကျပ်`,
    });
  };

  const getNumberColor = (num: number) => {
    if ([0, 5].includes(num)) return "bg-gradient-to-br from-purple-400 to-pink-400";
    if ([1, 3, 7, 9].includes(num)) return "bg-gradient-to-br from-green-400 to-emerald-500";
    return "bg-gradient-to-br from-red-400 to-rose-500";
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Card className="rounded-3xl shadow-lg overflow-hidden bg-background">
        {/* Timer Section */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold">Win Go 30s</div>
            <div className="text-4xl font-bold tracking-wider">
              00:{countdown.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-xs opacity-90">20251114100051532</div>
        </div>

        {/* Color Selection */}
        <div className="p-6 bg-muted/30">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              onClick={() => selectColor('green')}
              className={`h-14 text-lg font-bold rounded-xl ${
                selectedColor === 'green' 
                  ? 'bg-green-500 text-white shadow-lg scale-105' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              အစိမ်းရောင်
            </Button>
            <Button
              onClick={() => selectColor('purple')}
              className={`h-14 text-lg font-bold rounded-xl ${
                selectedColor === 'purple' 
                  ? 'bg-purple-500 text-white shadow-lg scale-105' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              ခရမ်းရောင်
            </Button>
            <Button
              onClick={() => selectColor('red')}
              className={`h-14 text-lg font-bold rounded-xl ${
                selectedColor === 'red' 
                  ? 'bg-red-500 text-white shadow-lg scale-105' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              အနီရောင်
            </Button>
          </div>

          {/* Number Selection */}
          <div className="bg-white/50 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-5 gap-3">
              {numbers.map((num) => (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  className={`aspect-square rounded-full ${getNumberColor(num)} 
                    flex items-center justify-center text-white text-2xl font-bold 
                    shadow-lg transition-all ${
                      selectedNumbers.includes(num.toString()) 
                        ? 'scale-110 ring-4 ring-yellow-400' 
                        : 'hover:scale-105'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Selection */}
          <div className="grid grid-cols-6 gap-2 mb-6">
            {multipliers.map((mult) => (
              <Button
                key={mult}
                onClick={() => setMultiplier(mult)}
                variant={multiplier === mult ? "default" : "outline"}
                className={`h-12 font-bold ${
                  multiplier === mult 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                X{mult}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => placeBet('big')}
              className="h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white shadow-lg"
            >
              အကြီး
            </Button>
            <Button
              onClick={() => placeBet('small')}
              className="h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            >
              သေး
            </Button>
          </div>

          {/* Balance Info */}
          <div className="text-center mt-4 text-sm">
            <span className="text-muted-foreground">လက်ကျန်ငွေ: </span>
            <span className="font-bold text-primary text-lg">{userBalance.toLocaleString()} ကျပ်</span>
            <span className="text-muted-foreground ml-4">ထိုးငွေ: </span>
            <span className="font-bold text-green-600 text-lg">{(baseAmount * multiplier).toLocaleString()} ကျပ်</span>
          </div>
        </div>
      </Card>
    </div>
  );
};