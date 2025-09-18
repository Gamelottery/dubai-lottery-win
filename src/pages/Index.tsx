import { useState, useEffect } from "react";
import { LotteryHeader } from "../components/LotteryHeader";
import { LotteryResults } from "../components/LotteryResults";
import { BettingInterface } from "../components/BettingInterface";
import { LoginForm } from "../components/LoginForm";
import { AdminPanel } from "../components/AdminPanel";
import { TransactionHistory } from "../components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  balance: number;
  user_type: 'user' | 'vip' | 'admin';
}

interface Bet {
  id: string;
  number: string;
  amount: number;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState<'lottery' | 'history' | 'admin'>('lottery');
  const [lotteryResults, setLotteryResults] = useState({
    morning: "45",
    afternoon: "23", 
    evening: "67",
  });
  const [nextDrawTime, setNextDrawTime] = useState("မနက် 9:30");

  // Demo user data - will be replaced by database data
  const demoUsers = [
    { id: '1', user_id: '11111111-1111-1111-1111-111111111111', name: "မြန်မာလူ", phone: "09123456789", balance: 50000, user_type: "user" as const },
    { id: '2', user_id: '22222222-2222-2222-2222-222222222222', name: "VIP ဖောက်သည်", phone: "09987654321", balance: 100000, user_type: "vip" as const },
    { id: '3', user_id: '33333333-3333-3333-3333-333333333333', name: "Admin", phone: "09750397287", balance: 500000, user_type: "admin" as const }
  ];

  const handleLogin = async (phone: string, password: string) => {
    // For demo purposes, we'll use the demo users
    // In production, this would authenticate with Supabase
    const user = demoUsers.find(u => u.phone === phone);
    if (user) {
      // Fetch real user data from database
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone)
          .single();
        
        if (data && !error) {
          setCurrentUser({
            ...data,
            user_type: data.user_type as 'user' | 'vip' | 'admin'
          });
        } else {
          setCurrentUser(user); // Fallback to demo data
        }
        setShowLogin(false);
        setCurrentView('lottery');
      } catch (error) {
        setCurrentUser(user); // Fallback to demo data
        setShowLogin(false);
        setCurrentView('lottery');
      }
    }
  };

  const handleDeposit = async () => {
    // Refresh user balance after transaction
    if (currentUser) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .single();
        
        if (data && !error) {
          setCurrentUser({
            ...data,
            user_type: data.user_type as 'user' | 'vip' | 'admin'
          });
        }
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const handleWithdraw = async () => {
    // Refresh user balance after transaction
    if (currentUser) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .single();
        
        if (data && !error) {
          setCurrentUser({
            ...data,
            user_type: data.user_type as 'user' | 'vip' | 'admin'
          });
        }
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setCurrentView('lottery');
  };

  const handlePlaceBets = async (bets: Bet[]) => {
    if (!currentUser) return;
    
    const totalAmount = getTotalBetAmount(bets);
    if (currentUser.balance >= totalAmount) {
      try {
        // Insert bets into database
        const betInserts = bets.map(bet => ({
          user_id: currentUser.user_id,
          number: bet.number,
          amount: bet.amount,
          draw_time: "Next Draw", // This could be dynamic based on next draw time
          status: 'pending'
        }));

        const { error } = await supabase
          .from('bets')
          .insert(betInserts);

        if (error) throw error;

        // Update user balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: currentUser.balance - totalAmount })
          .eq('user_id', currentUser.user_id);

        if (updateError) throw updateError;

        // Update local state
        setCurrentUser({
          ...currentUser,
          balance: currentUser.balance - totalAmount
        });

        console.log("Bets placed:", bets);
      } catch (error) {
        console.error('Error placing bets:', error);
      }
    }
  };

  const getTotalBetAmount = (bets: Bet[]) => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
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
    const interval = setInterval(updateNextDraw, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
      {showLogin ? (
        <LoginForm onLogin={handleLogin} onShowRegister={() => {}} />
      ) : (
        <div className="space-y-6 p-4">
          <LotteryHeader
            userName={currentUser?.name}
            userPhone={currentUser?.phone}
            balance={currentUser?.balance || 0}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onLogout={handleLogout}
            userId={currentUser?.user_id}
          />
          
          {/* Navigation */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={currentView === 'lottery' ? 'default' : 'outline'}
              onClick={() => setCurrentView('lottery')}
            >
              လောင်းကစား
            </Button>
            <Button
              variant={currentView === 'history' ? 'default' : 'outline'}
              onClick={() => setCurrentView('history')}
            >
              မှတ်တမ်း
            </Button>
            {currentUser?.user_type === 'admin' && (
              <Button
                variant={currentView === 'admin' ? 'default' : 'outline'}
                onClick={() => setCurrentView('admin')}
              >
                Admin Panel
              </Button>
            )}
          </div>
          
          {currentView === 'lottery' && (
            <>
              <LotteryResults
                results={lotteryResults}
                nextDrawTime={nextDrawTime}
              />
              
              <BettingInterface
                onPlaceBets={handlePlaceBets}
                userBalance={currentUser?.balance || 0}
              />
            </>
          )}
          
          {currentView === 'history' && currentUser && (
            <TransactionHistory userId={currentUser.user_id} />
          )}
          
          {currentView === 'admin' && currentUser?.user_type === 'admin' && (
            <AdminPanel />
          )}
        </div>
      )}
    </div>
  );
};

export default Index;