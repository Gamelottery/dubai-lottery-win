import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [numberInput, setNumberInput] = useState("");
  const [amountInput, setAmountInput] = useState("100");
  const [bets, setBets] = useState<Bet[]>([]);
  const [multiNumberMode, setMultiNumberMode] = useState(false);
  const { toast } = useToast();

  const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const addBet = () => {
    if (!numberInput || !amountInput) {
      toast({
        title: "လိုအပ်သော အချက်အလက်များ မရှိပါ",
        description: "နံပါတ်နှင့် ငွေပမာဏ ထည့်သွင်းပါ",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(amountInput);

    if (amount < 100) {
      toast({
        title: "အနည်းဆုံး ထိုးငွေ",
        description: "အနည်းဆုံး ၁၀၀ ကျပ် ထိုးရပါမည်",
        variant: "destructive",
      });
      return;
    }

    // Handle multiple numbers separated by comma or space
    const numbers = numberInput
      .split(/[,\s]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    let addedCount = 0;
    for (const number of numbers) {
      if (number.length !== 2 || !/^\d{2}$/.test(number)) {
        toast({
          title: "မှားယွင်းသော နံပါတ်",
          description: `နံပါတ် ${number} မှားယွင်းနေပါသည် (၂ လုံးသာ ထည့်သွင်းပါ)`,
          variant: "destructive",
        });
        continue;
      }

      // Check if number already exists
      const existingBet = bets.find(bet => bet.number === number);
      if (existingBet) {
        setBets(prev => prev.map(bet => 
          bet.number === number 
            ? { ...bet, amount: bet.amount + amount }
            : bet
        ));
      } else {
        const newBet: Bet = {
          id: Date.now().toString() + number,
          number,
          amount,
        };
        setBets(prev => [...prev, newBet]);
      }
      addedCount++;
    }

    if (addedCount > 0) {
      toast({
        title: "ထီထည့်ပြီးပါပြီ",
        description: `${addedCount} နံပါတ် - ${(amount * addedCount).toLocaleString()} ကျပ်`,
      });
      setNumberInput("");
    }
  };
  
  const setQuickAmount = (amount: number) => {
    setAmountInput(amount.toString());
  };

  const removeBet = (id: string) => {
    setBets(bets.filter(bet => bet.id !== id));
  };

  const placeBets = () => {
    if (bets.length === 0) {
      toast({
        title: "ထီမထိုးရသေးပါ",
        description: "အနည်းဆုံး တစ်နံပါတ် ထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount > userBalance) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    onPlaceBets(bets);
    setBets([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="lottery-card rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">🎯 ထီထိုးရန်</h2>
          <p className="opacity-90 text-lg">နံပါတ်နှင့် ငွေပမာဏ ထည့်သွင်းပါ</p>
        </div>

        {/* Betting Form */}
        <div className="p-8">
          <Card className="bg-muted/20 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">
                🎫 ထီထိုးရန် ထည့်သွင်းပါ
              </h3>
              <Button
                variant={multiNumberMode ? "default" : "outline"}
                size="sm"
                onClick={() => setMultiNumberMode(!multiNumberMode)}
                className="text-xs"
              >
                {multiNumberMode ? "📝 တစ်နံပါတ်စီ" : "📋 များစွာ"}
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  နံပါတ် {multiNumberMode && <span className="text-muted-foreground text-sm">(comma သို့မဟုတ် space ဖြင့် ခွဲပါ)</span>}
                </Label>
                <Input
                  type="text"
                  value={numberInput}
                  onChange={(e) => {
                    if (multiNumberMode) {
                      setNumberInput(e.target.value);
                    } else {
                      setNumberInput(e.target.value.replace(/\D/g, '').slice(0, 2));
                    }
                  }}
                  placeholder={multiNumberMode ? "ဥပမာ: 12, 23, 45, 67" : "ဥပမာ: 23"}
                  maxLength={multiNumberMode ? undefined : 2}
                  className="mt-2 h-14 text-center text-2xl font-bold border-2 focus:border-primary"
                />
              </div>
              
              <div>
                <Label className="text-base font-medium">ငွေပမာဏ (ကျပ်)</Label>
                <Input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="100"
                  min="100"
                  step="100"
                  className="mt-2 h-14 text-center text-xl font-bold border-2 focus:border-primary"
                />
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={amountInput === amount.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuickAmount(amount)}
                      className="h-10 text-sm font-bold"
                    >
                      {amount >= 1000 ? `${amount/1000}K` : amount}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={addBet}
                variant="lottery-success"
                size="lg"
                className="w-full h-14 text-lg"
              >
                ➕ ထည့်မည်
              </Button>
            </div>
          </Card>

          {/* Bet List */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-primary">
              📋 ထိုးထားသော ထီများ
            </h3>
            <div className="space-y-4 min-h-[100px]">
              {bets.length === 0 ? (
                <Card className="text-center py-12 text-muted-foreground bg-muted/10">
                  <p className="text-lg">ထီမထိုးရသေးပါ</p>
                  <p className="text-sm mt-2">နံပါတ်နှင့် ငွေပမာဏ ထည့်ပြီး ထည့်မည် ကိုနှိပ်ပါ</p>
                </Card>
              ) : (
                bets.map((bet) => (
                  <Card key={bet.id} className="bet-card p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="lottery-number text-3xl font-black">
                        {bet.number}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-primary">
                          {bet.amount.toLocaleString()} ကျပ်
                        </div>
                        <div className="text-sm text-muted-foreground">
                          နံပါတ် {bet.number}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeBet(bet.id)}
                      variant="destructive"
                      size="sm"
                    >
                      🗑️
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Total Amount */}
          <Card className="bg-warning/10 border-warning/30 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">💵 စုစုပေါင်း</span>
              <span className="text-3xl font-bold text-accent animate-lottery-glow">
                {totalAmount.toLocaleString()} ကျပ်
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              လက်ကျန်ငွေ: {userBalance.toLocaleString()} ကျပ်
            </div>
          </Card>

          {/* Place Bet Button */}
          <Button
            onClick={placeBets}
            variant="lottery"
            size="xl"
            className="w-full text-xl"
            disabled={bets.length === 0 || totalAmount > userBalance}
          >
            🎯 ထီထိုးမည်
            {bets.length > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                {bets.length}
              </span>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};