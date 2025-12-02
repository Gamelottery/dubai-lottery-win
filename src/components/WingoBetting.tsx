import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface WingoBet {
  id: string;
  type: 'color' | 'number' | 'size';
  value: string;
  amount: number;
  multiplier: number;
  period: '30s' | '1min' | '3min' | '5min';
}

interface WingoBettingProps {
  onPlaceBet: (bet: WingoBet) => void;
  userBalance: number;
  selectedPeriod: '30s' | '1min' | '3min' | '5min';
  onPeriodChange: (period: '30s' | '1min' | '3min' | '5min') => void;
}

const colors = [
  { name: 'green', label: 'အစိမ်း', color: 'bg-emerald-500', multiplier: 2, numbers: [1, 3, 7, 9] },
  { name: 'violet', label: 'ခရမ်း', color: 'bg-violet-500', multiplier: 4.5, numbers: [0, 5] },
  { name: 'red', label: 'အနီ', color: 'bg-red-500', multiplier: 2, numbers: [2, 4, 6, 8] },
];

const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const sizes = [
  { name: 'big', label: 'အကြီး (5-9)', multiplier: 2 },
  { name: 'small', label: 'အသေး (0-4)', multiplier: 2 },
];

export const WingoBetting = ({ onPlaceBet, userBalance, selectedPeriod, onPeriodChange }: WingoBettingProps) => {
  const [selectedType, setSelectedType] = useState<'color' | 'number' | 'size' | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [amountInput, setAmountInput] = useState("100");
  const [multiplier, setMultiplier] = useState(1);
  const { toast } = useToast();

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const getNumberColor = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'bg-emerald-500 hover:bg-emerald-600';
    if ([0, 5].includes(num)) return 'bg-gradient-to-r from-violet-500 to-red-500 hover:from-violet-600 hover:to-red-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const handleColorSelect = (colorName: string, mult: number) => {
    setSelectedType('color');
    setSelectedValue(colorName);
    setMultiplier(mult);
  };

  const handleNumberSelect = (num: number) => {
    setSelectedType('number');
    setSelectedValue(num.toString());
    setMultiplier(9);
  };

  const handleSizeSelect = (sizeName: string, mult: number) => {
    setSelectedType('size');
    setSelectedValue(sizeName);
    setMultiplier(mult);
  };

  const clearSelection = () => {
    setSelectedType(null);
    setSelectedValue('');
    setMultiplier(1);
  };

  const placeBet = () => {
    if (!selectedType || !selectedValue) {
      toast({
        title: "ရွေးချယ်မှု လိုအပ်ပါသည်",
        description: "အရောင်၊ ဂဏန်း သို့မဟုတ် အကြီး/အသေး ရွေးချယ်ပါ",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(amountInput);
    if (isNaN(amount) || amount < 100) {
      toast({
        title: "အနည်းဆုံး ထိုးငွေ",
        description: "အနည်းဆုံး ၁၀၀ ကျပ် ထိုးရပါမည်",
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    const bet: WingoBet = {
      id: Date.now().toString(),
      type: selectedType,
      value: selectedValue,
      amount,
      multiplier,
      period: selectedPeriod,
    };

    onPlaceBet(bet);
    
    const typeLabel = selectedType === 'color' ? 'အရောင်' : selectedType === 'number' ? 'ဂဏန်း' : 'အကြီး/အသေး';
    toast({
      title: "ထီထိုးပြီးပါပြီ",
      description: `${typeLabel}: ${selectedValue} - ${amount.toLocaleString()} ကျပ် (x${multiplier})`,
    });

    clearSelection();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="lottery-card rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-2 animate-sparkle">🎰 Wingo Game</h2>
          <p className="opacity-90 text-lg">အရောင်၊ ဂဏန်း သို့မဟုတ် အကြီး/အသေး ရွေးချယ်ပါ</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Period Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              ⏱️ အချိန်ရွေးချယ်ရန်
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '30s', label: '30 စက္ကန့်' },
                { value: '1min', label: '1 မိနစ်' },
                { value: '3min', label: '3 မိနစ်' },
                { value: '5min', label: '5 မိနစ်' },
              ].map((period) => (
                <Button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value as any)}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  className="h-14 text-sm font-bold transition-all duration-300"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              🎨 အရောင်ရွေးချယ်ရန် <span className="text-sm font-normal text-muted-foreground">(x2 / x4.5)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <Button
                  key={color.name}
                  onClick={() => handleColorSelect(color.name, color.multiplier)}
                  className={`h-16 text-lg font-bold text-white transition-all duration-300 ${color.color} ${
                    selectedType === 'color' && selectedValue === color.name
                      ? 'ring-4 ring-primary ring-offset-2 scale-105'
                      : 'hover:scale-102'
                  }`}
                >
                  <div className="text-center">
                    <div>{color.label}</div>
                    <div className="text-xs opacity-80">x{color.multiplier}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Number Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              🔢 ဂဏန်းရွေးချယ်ရန် <span className="text-sm font-normal text-muted-foreground">(x9)</span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {numbers.map((num) => (
                <Button
                  key={num}
                  onClick={() => handleNumberSelect(num)}
                  className={`h-14 text-xl font-bold text-white transition-all duration-300 ${getNumberColor(num)} ${
                    selectedType === 'number' && selectedValue === num.toString()
                      ? 'ring-4 ring-primary ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Big/Small Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              📊 အကြီး/အသေး <span className="text-sm font-normal text-muted-foreground">(x2)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sizes.map((size) => (
                <Button
                  key={size.name}
                  onClick={() => handleSizeSelect(size.name, size.multiplier)}
                  variant="outline"
                  className={`h-16 text-lg font-bold transition-all duration-300 ${
                    selectedType === 'size' && selectedValue === size.name
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/50 scale-105'
                      : 'hover:bg-primary/10 hover:scale-102'
                  }`}
                >
                  <div className="text-center">
                    <div>{size.label}</div>
                    <div className="text-xs opacity-70">x{size.multiplier}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Bet Display */}
          {selectedType && (
            <Card className="bg-primary/10 border-primary/30 p-4 animate-scale-in">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-muted-foreground">ရွေးချယ်ထားသော:</span>
                  <div className="text-xl font-bold text-primary">
                    {selectedType === 'color' && colors.find(c => c.name === selectedValue)?.label}
                    {selectedType === 'number' && `ဂဏန်း ${selectedValue}`}
                    {selectedType === 'size' && sizes.find(s => s.name === selectedValue)?.label}
                    <span className="text-sm ml-2">(x{multiplier})</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  ✕ ဖျက်မည်
                </Button>
              </div>
            </Card>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-primary">💰 ငွေပမာဏ</h3>
            <Input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="100"
              min="100"
              step="100"
              className="h-14 text-center text-xl font-bold border-2 focus:border-primary"
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={amountInput === amount.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmountInput(amount.toString())}
                  className="h-10 text-sm font-bold"
                >
                  {amount >= 1000 ? `${amount/1000}K` : amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Place Bet Button */}
          <Button
            onClick={placeBet}
            disabled={!selectedType || !selectedValue}
            variant="lottery"
            size="xl"
            className="w-full text-xl h-16 disabled:opacity-50"
          >
            🎯 ထိုးမည် {selectedType && `(နိုင်ရင် x${multiplier})`}
          </Button>

          {/* Balance Display */}
          <div className="text-center text-sm text-muted-foreground">
            လက်ကျန်ငွေ: <span className="font-bold text-primary">{userBalance.toLocaleString()} ကျပ်</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
