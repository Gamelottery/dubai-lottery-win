import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { LotteryHeader } from "../components/LotteryHeader";
import { LotteryResults } from "../components/LotteryResults";
import { LotteryResultsHistory } from "../components/LotteryResultsHistory";
import { BettingInterface } from "../components/BettingInterface";
import { WingoBetting } from "../components/WingoBetting";
import { WingoHistory } from "../components/WingoHistory";
import { CountdownTimer } from "../components/CountdownTimer";
import { LoginForm } from "../components/LoginForm";
import { UserRegistrationForm } from "../components/UserRegistrationForm";
import { AdminPanel } from "../components/AdminPanel";
import { TransactionHistory } from "../components/TransactionHistory";
import { WinningAnimation } from "../components/WinningAnimation";
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

interface WingoBet {
  id: string;
  type: 'color' | 'number' | 'size';
  value: string;
  amount: number;
  multiplier: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState<'wingo' | '2d' | 'history' | 'results-history' | 'admin'>('wingo');
  const [nextDrawTime, setNextDrawTime] = useState("11:00 AM");
  const [showWinningAnimation, setShowWinningAnimation] = useState(false);
  const [winningAmount, setWinningAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;

    // Use unique channel name per user to avoid conflicts across devices
    const channelName = `profile-changes-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload);
          const newProfile = payload.new as UserProfile;
          setUserProfile(newProfile);
          
          // Show notification when balance changes
          if (userProfile && newProfile.balance !== userProfile.balance) {
            toast({
              title: "လက်ကျန်ငွေ အပ်ဒိတ်လုပ်ပြီးပါပြီ",
              description: `လက်ကျန်ငွေ: ${newProfile.balance.toLocaleString()} ကျပ်`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userProfile, toast]);

  // Real-time subscription for winning bets
  useEffect(() => {
    if (!user) return;

    const winningChannel = supabase
      .channel(`bet-wins-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedBet = payload.new as any;
          
          // Trigger winning animation if bet status changed to "won"
          if (updatedBet.status === 'won' && updatedBet.winning_amount && updatedBet.winning_amount > 0) {
            setWinningAmount(updatedBet.winning_amount);
            setShowWinningAnimation(true);
            
            toast({
              title: "🎉 ထီပေါက်ပါပြီ!",
              description: `နံပါတ် ${updatedBet.number} - ${updatedBet.winning_amount.toLocaleString()} ကျပ် ရရှိပါပြီ!`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(winningChannel);
    };
  }, [user, toast]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        setUserProfile(data as UserProfile);
      } else {
        console.log('No profile found for user:', userId);
        // Create a basic profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            name: 'User',
            phone: '',
            balance: 0,
            user_type: 'user'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          setUserProfile(newProfile as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const handleLogin = async (phone: string, password: string) => {
    try {
      console.log('Attempting login for phone:', phone);
      
      // Try with .com domain first (new format)
      let email = `${phone}@lottery.com`;
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If failed, try with .mm domain (old format for existing accounts)
      if (error) {
        console.log('Trying with .mm domain...');
        email = `phone_${phone}@lottery.mm`;
        const result = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.id);
      toast({
        title: "ဝင်ရောက်မှု အောင်မြင်ပါသည်",
        description: `ကြိုဆိုပါသည်`,
      });
    } catch (error: any) {
      console.error('Login failed:', error.message);
      toast({
        title: "အကောင့်ဝင်ရောက်ရန် မအောင်မြင်ပါ",
        description: "ဖုန်းနံပါတ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားနေပါသည်",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Clear local state immediately
      setUser(null);
      setUserProfile(null);
      setCurrentView('wingo');
      
      toast({
        title: "အကောင့်မှ ထွက်ပြီးပါပြီ",
        description: "ကျေးဇူးတင်ပါသည်",
      });
    } catch (error: any) {
      console.error('Failed to logout:', error);
      // Force clear state even if signOut fails
      setUser(null);
      setUserProfile(null);
      setCurrentView('wingo');
      
      toast({
        title: "အကောင့်မှ ထွက်ပြီးပါပြီ",
        description: "ကျေးဇူးတင်ပါသည်",
      });
    }
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

  const handlePlaceWingoBet = async (bet: WingoBet) => {
    if (!user || !userProfile) return;
    
    if (userProfile.balance < bet.amount) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ငွေသွင်းပြီး ထီထိုးပါ",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format bet number based on type
      let betNumber = '';
      if (bet.type === 'color') {
        betNumber = `color_${bet.value}`;
      } else if (bet.type === 'number') {
        betNumber = bet.value.padStart(2, '0');
      } else {
        betNumber = `size_${bet.value}`;
      }

      const { error } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          number: betNumber,
          amount: bet.amount,
          draw_time: nextDrawTime,
          status: 'pending'
        });

      if (error) throw error;

      // Update user balance
      const newBalance = userProfile.balance - bet.amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setUserProfile({
        ...userProfile,
        balance: newBalance
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

  // Update next draw time - automatically assign to nearest upcoming draw
  useEffect(() => {
    const updateNextDraw = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Draw times: 11:00 AM, 1:00 PM, 3:00 PM, 5:00 PM, 7:00 PM, 9:00 PM
      if (hour < 11) {
        setNextDrawTime("11:00 AM");
      } else if (hour < 13) {
        setNextDrawTime("1:00 PM");
      } else if (hour < 15) {
        setNextDrawTime("3:00 PM");
      } else if (hour < 17) {
        setNextDrawTime("5:00 PM");
      } else if (hour < 19) {
        setNextDrawTime("7:00 PM");
      } else if (hour < 21) {
        setNextDrawTime("9:00 PM");
      } else {
        setNextDrawTime("11:00 AM");
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
            variant={currentView === 'wingo' ? 'default' : 'outline'}
            onClick={() => setCurrentView('wingo')}
            className="text-lg"
          >
            🎰 Wingo
          </Button>
          <Button
            variant={currentView === '2d' ? 'default' : 'outline'}
            onClick={() => setCurrentView('2d')}
            className="text-lg"
          >
            🎯 2D
          </Button>
          <Button
            variant={currentView === 'history' ? 'default' : 'outline'}
            onClick={() => setCurrentView('history')}
          >
            📊 ငွေသွင်း/ငွေထုတ်
          </Button>
          <Button
            variant={currentView === 'results-history' ? 'default' : 'outline'}
            onClick={() => setCurrentView('results-history')}
          >
            📋 ထီရလဒ်
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
        
        {currentView === 'wingo' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <WingoBetting
              onPlaceBet={handlePlaceWingoBet}
              userBalance={userProfile?.balance || 0}
            />
            <WingoHistory />
          </div>
        )}
        
        {currentView === '2d' && (
          <>
            <div className="max-w-2xl mx-auto">
              <CountdownTimer nextDrawTime={nextDrawTime} />
            </div>
            
            <LotteryResults nextDrawTime={nextDrawTime} />
            
            <div className="max-w-2xl mx-auto">
              <BettingInterface
                onPlaceBets={handlePlaceBets}
                userBalance={userProfile?.balance || 0}
              />
            </div>
            
            <TransactionHistory userId={user.id} />
          </>
        )}
        
        {currentView === 'history' && user && (
          <TransactionHistory userId={user.id} />
        )}
        
        {currentView === 'results-history' && (
          <LotteryResultsHistory />
        )}
        
        {currentView === 'admin' && userProfile?.user_type === 'admin' && (
          <AdminPanel />
        )}
      </div>
      
      {/* Winning Animation Overlay */}
      <WinningAnimation 
        show={showWinningAnimation} 
        winAmount={winningAmount}
        onComplete={() => setShowWinningAnimation(false)}
      />
    </div>
  );
};

export default Index;