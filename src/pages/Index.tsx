import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { LotteryHeader } from "../components/LotteryHeader";
import { LotteryResults } from "../components/LotteryResults";
import { BettingInterface } from "../components/BettingInterface";
import { LoginForm } from "../components/LoginForm";
import { UserRegistrationForm } from "../components/UserRegistrationForm";
import { AdminPanel } from "../components/AdminPanel";
import { TransactionHistory } from "../components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<'lottery' | 'history' | 'admin'>('lottery');
  const [nextDrawTime, setNextDrawTime] = useState("မနက် 9:30");
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${phone}@lottery.mm`,
        password: password,
      });

      if (error) throw error;

      toast({
        title: "ဝင်ရောက်မှု အောင်မြင်ပါသည်",
        description: `ကြိုဆိုပါသည် ${userProfile?.name || 'User'}`,
      });
    } catch (error: any) {
      toast({
        title: "အကောင့်ဝင်ရောက်ရန် မအောင်မြင်ပါ",
        description: "ဖုန်းနံပါတ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားနေပါသည်",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('lottery');
    toast({
      title: "အကောင့်မှ ထွက်ပြီးပါပြီ",
      description: "ကျေးဇူးတင်ပါသည်",
    });
  };

  const handlePlaceBets = async (bets: Bet[]) => {
    if (!user || !userProfile) return;
    
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    if (userProfile.balance < totalAmount) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert bets into database
      const betInserts = bets.map(bet => ({
        user_id: user.id,
        number: bet.number,
        amount: bet.amount,
        draw_time: nextDrawTime,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('bets')
        .insert(betInserts);

      if (error) throw error;

      // Update user balance
      const newBalance = userProfile.balance - totalAmount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setUserProfile({
        ...userProfile,
        balance: newBalance
      });

      toast({
        title: "ထီထိုးပြီးပါပြီ",
        description: `${bets.length} နံပါတ် - ${totalAmount.toLocaleString()} ကျပ်`,
      });
    } catch (error) {
      toast({
        title: "ထီထိုးရန် မအောင်မြင်ပါ",
        description: "ပြန်လည်ကြိုးစားပါ",
        variant: "destructive",
      });
    }
  };

  const refreshUserProfile = () => {
    if (user) {
      fetchUserProfile(user.id);
    }
  };

  // Update next draw time
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

  if (showRegister) {
    return (
      <UserRegistrationForm 
        onBack={() => setShowRegister(false)}
        onSuccess={() => {
          setShowRegister(false);
          toast({
            title: "🎉 ကြိုဆိုပါသည်",
            description: "အကောင့်ဖွင့်ပြီး ဝင်ရောက်နိုင်ပါပြီ",
          });
        }}
      />
    );
  }

  if (!user) {
    return (
      <LoginForm 
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
      <div className="space-y-6 p-4">
        <LotteryHeader
          userName={userProfile?.name}
          userPhone={userProfile?.phone}
          balance={userProfile?.balance || 0}
          onDeposit={refreshUserProfile}
          onWithdraw={refreshUserProfile}
          onLogout={handleLogout}
          userId={user?.id || ""}
        />
        
        {/* Navigation */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant={currentView === 'lottery' ? 'default' : 'outline'}
            onClick={() => setCurrentView('lottery')}
          >
            🎯 လောင်းကစား
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'outline'}
            onClick={() => setCurrentView('history')}
          >
            📊 မှတ်တမ်း
          </Button>
          {userProfile?.user_type === 'admin' && (
            <Button
              variant={currentView === 'admin' ? 'default' : 'outline'}
              onClick={() => setCurrentView('admin')}
            >
              🔧 Admin Panel
            </Button>
          )}
        </div>
        
        {currentView === 'lottery' && (
          <>
            <LotteryResults nextDrawTime={nextDrawTime} />
            
            <BettingInterface
              onPlaceBets={handlePlaceBets}
              userBalance={userProfile?.balance || 0}
            />
          </>
        )}
        
        {currentView === 'history' && user && (
          <TransactionHistory userId={user.id} />
        )}
        
        {currentView === 'admin' && userProfile?.user_type === 'admin' && (
          <AdminPanel />
        )}
      </div>
    </div>
  );
};

export default Index;