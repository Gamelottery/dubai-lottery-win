import { LotteryHeader } from "@/components/LotteryHeader";
import { LotteryResults } from "@/components/LotteryResults";
import { BettingInterface } from "@/components/BettingInterface";
import { LoginForm } from "@/components/LoginForm";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  phone: string;
  balance: number;
  type: 'user' | 'vip' | 'admin';
}

interface Bet {
  id: string;
  number: string;
  amount: number;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [lotteryResults, setLotteryResults] = useState({
    morning: null as string | null,
    afternoon: null as string | null,
    evening: null as string | null,
  });
  const [nextDrawTime, setNextDrawTime] = useState("မနက် 9:30");
  const { toast } = useToast();

  // Demo users for testing
  const demoUsers: Record<string, User> = {
    "09123456789": { name: "User Demo", phone: "09123456789", balance: 50000, type: 'user' },
    "09987654321": { name: "VIP User", phone: "09987654321", balance: 100000, type: 'vip' },
    "09750397287": { name: "Admin User", phone: "09750397287", balance: 1000000, type: 'admin' },
  };

  const handleLogin = (phone: string, password: string) => {
    // Simple demo authentication
    const validCredentials = [
      { phone: "09123456789", password: "123456" },
      { phone: "09987654321", password: "vip123" },
      { phone: "09750397287", password: "admin123" },
    ];

    const isValid = validCredentials.some(
      cred => cred.phone === phone && cred.password === password
    );

    if (isValid && demoUsers[phone]) {
      setCurrentUser(demoUsers[phone]);
      setShowLogin(false);
      toast({
        title: "ကြိုဆိုပါတယ်! 🎉",
        description: `${demoUsers[phone].name} အဖြစ် အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ`,
      });
    } else {
      toast({
        title: "ဝင်ရောက်မှု မအောင်မြင်ပါ",
        description: "ဖုန်းနံပါတ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = () => {
    toast({
      title: "ငွေသွင်း Feature",
      description: "Payment gateway integration လုပ်ရန် လိုအပ်ပါသည်",
    });
  };

  const handleWithdraw = () => {
    toast({
      title: "ငွေထုတ် Feature", 
      description: "Withdrawal system integration လုပ်ရန် လိုအပ်ပါသည်",
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    toast({
      title: "အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ",
      description: "မကြာမီ ပြန်လာပါနော်! 👋",
    });
  };

  const handlePlaceBets = (bets: Bet[]) => {
    if (!currentUser) return;

    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    if (totalAmount > currentUser.balance) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    // Update user balance (in real app, this would be handled by backend)
    setCurrentUser({
      ...currentUser,
      balance: currentUser.balance - totalAmount
    });

    toast({
      title: "ထီထိုးမှု အောင်မြင်ပါပြီ! 🎯",
      description: `${bets.length} နံပါတ် - စုစုပေါင်း ${totalAmount.toLocaleString()} ကျပ်`,
    });

    // In real app, save bets to backend
    console.log("Placed bets:", bets);
  };

  // Update next draw time (simplified)
  useEffect(() => {
    const updateNextDraw = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      if (hour < 9 || (hour === 9 && minute < 30)) {
        setNextDrawTime("မနက် 9:30");
      } else if (hour < 14) {
        setNextDrawTime("နေ့လည် 2:00");
      } else if (hour < 16 || (hour === 16 && minute < 30)) {
        setNextDrawTime("ညနေ 4:30");
      } else {
        setNextDrawTime("မနက်ဖြန် မနက် 9:30");
      }
    };

    updateNextDraw();
    const interval = setInterval(updateNextDraw, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (showLogin) {
    return (
      <LoginForm 
        onLogin={handleLogin}
        onShowRegister={() => toast({
          title: "Registration Feature",
          description: "Registration system ကို implement လုပ်ရန် လိုအပ်ပါသည်",
        })}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <LotteryHeader
          userName={currentUser?.name}
          userPhone={currentUser?.phone}
          balance={currentUser?.balance || 0}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onLogout={handleLogout}
        />

        {/* Lottery Results */}
        <LotteryResults
          results={lotteryResults}
          nextDrawTime={nextDrawTime}
        />

        {/* Betting Interface */}
        <BettingInterface
          onPlaceBets={handlePlaceBets}
          userBalance={currentUser?.balance || 0}
        />
      </div>
    </div>
  );
};

export default Index;
