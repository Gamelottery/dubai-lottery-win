import { Button } from "@/components/ui/button";

interface LotteryHeaderProps {
  userName?: string;
  userPhone?: string;
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onLogout: () => void;
}

export const LotteryHeader = ({ 
  userName, 
  userPhone, 
  balance, 
  onDeposit, 
  onWithdraw, 
  onLogout 
}: LotteryHeaderProps) => {
  return (
    <div className="lottery-card rounded-2xl shadow-card mb-8 overflow-hidden">
      <div className="bg-gradient-primary p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <span className="text-3xl">👤</span>
            </div>
            <div className="text-white">
              <div className="font-bold text-xl">{userName || 'Guest User'}</div>
              <div className="text-sm opacity-90">{userPhone || 'No phone'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white text-right">
              <div className="text-xs opacity-75">လက်ကျန်ငွေ</div>
              <div className="font-bold text-xl lottery-glow">
                {balance.toLocaleString()} ကျပ်
              </div>
            </div>
            <Button 
              variant="lottery-success" 
              size="sm"
              onClick={onDeposit}
              className="text-xs"
              title="ငွေသွင်း"
            >
              💰
            </Button>
            <Button 
              variant="lottery-secondary" 
              size="sm"
              onClick={onWithdraw}
              className="text-xs"
              title="ငွေထုတ်"
            >
              🏧
            </Button>
            <Button 
              variant="lottery-outline" 
              size="sm"
              onClick={onLogout}
              className="text-xs border-white/30 text-white hover:bg-white hover:text-primary"
            >
              🚪
            </Button>
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