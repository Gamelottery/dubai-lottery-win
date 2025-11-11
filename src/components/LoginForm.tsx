import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (phone: string, password: string) => void;
  onShowRegister: () => void;
}

export const LoginForm = ({ onLogin, onShowRegister }: LoginFormProps) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !password) {
      toast({
        title: "လိုအပ်သော အချက်အလက်များ မရှိပါ",
        description: "ဖုန်းနံပါတ်နှင့် လျှို့ဝှက်နံပါတ် ထည့်သွင်းပါ",
        variant: "destructive",
      });
      return;
    }

    onLogin(phone, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="lottery-card rounded-2xl shadow-card max-w-md w-full overflow-hidden">
        {/* Login Header */}
        <div className="bg-gradient-primary p-8 text-white text-center">
          <div className="text-5xl mb-4 animate-lottery-bounce">🎰</div>
          <h1 className="text-3xl font-bold mb-2">BM 2D</h1>
          <p className="opacity-90 text-lg">BM ၂လုံး ထီ</p>
        </div>
        
        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-primary">
            🔐 အကောင့်ဝင်ရောက်ရန်
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">📱 ဖုန်းနံပါတ်</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="mt-2 h-12 text-lg border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground mt-1">
                ဥပမာ: 09123456789
              </p>
            </div>
            
            <div>
              <Label className="text-base font-medium">🔑 လျှို့ဝှက်နံပါတ်</Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="လျှို့ဝှက်နံပါတ် ထည့်ပါ"
                  className="h-12 text-lg border-2 focus:border-primary pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? "🙈" : "👁️"}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit"
              variant="lottery"
              size="xl"
              className="w-full text-lg"
            >
              🚀 ဝင်ရောက်မည်
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">အကောင့်မရှိသေးဘူးလား?</p>
            <Button 
              variant="lottery-outline" 
              onClick={onShowRegister}
              className="font-medium"
            >
              📝 အကောင့်အသစ်ဖွင့်ရန်
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};