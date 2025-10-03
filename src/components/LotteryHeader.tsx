import { Button } from "@/components/ui/button";
import { DepositWithdrawDialog } from "./DepositWithdrawDialog";
import { Wallet, LogOut } from "lucide-react";

interface LotteryHeaderProps {
  userName?: string;
  userPhone?: string;
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onLogout: () => void;
  userId?: string;
}

export const LotteryHeader = ({ 
  userName, 
  userPhone, 
  balance, 
  onDeposit, 
  onWithdraw, 
  onLogout,
  userId = ""
}: LotteryHeaderProps) => {
  return (
    <div className="lottery-card rounded-2xl shadow-card mb-8 overflow-hidden">
      <div className="bg-gradient-primary p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* User Info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2 md:p-3">
                <span className="text-2xl md:text-3xl">👤</span>
              </div>
              <div className="text-white">
                <div className="font-bold text-lg md:text-xl">{userName || 'Guest User'}</div>
                <div className="text-xs md:text-sm opacity-90">{userPhone || 'No phone'}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/20 gap-1 md:gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">ထွက်မယ်</span>
            </Button>
          </div>

          {/* Balance & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5 md:h-6 md:w-6" />
              <div>
                <div className="text-xs opacity-75">လက်ကျန်ငွေ</div>
                <div className="font-bold text-lg md:text-xl lottery-glow">
                  {balance.toLocaleString()} ကျပ်
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <DepositWithdrawDialog 
                type="deposit" 
                userBalance={balance} 
                onSuccess={onDeposit} 
                userId={userId}
              >
                <Button 
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 font-bold"
                >
                  ငွေထည့်
                </Button>
              </DepositWithdrawDialog>
              
              <DepositWithdrawDialog 
                type="withdrawal" 
                userBalance={balance} 
                onSuccess={onWithdraw} 
                userId={userId}
              >
                <Button 
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 font-bold"
                >
                  ငွေထုတ်
                </Button>
              </DepositWithdrawDialog>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🎰 Myanmar 2D Lottery
        </h1>
        <p className="text-muted-foreground text-lg">
          မြန်မာ ၂လုံး ထီ - ကံကောင်းပါစေ! 🍀
        </p>
      </div>
    </div>
  );
};