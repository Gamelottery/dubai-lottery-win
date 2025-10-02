import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserRegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const UserRegistrationForm = ({ onBack, onSuccess }: UserRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    const { name, phone, password, confirmPassword } = formData;

    if (!name.trim()) {
      toast({
        title: "နာမည် လိုအပ်ပါသည်",
        description: "သင့်နာမည်ကို ထည့်သွင်းပါ",
        variant: "destructive",
      });
      return false;
    }

    if (!phone.trim() || !/^09\d{8,9}$/.test(phone.trim())) {
      toast({
        title: "မှားယွင်းသော ဖုန်းနံပါတ်",
        description: "09 ဖြင့်စတဲ့ မြန်မာဖုန်းနံပါတ် ထည့်ပါ",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "လျှို့ဝှက်နံပါတ် အားနည်းပါသည်",
        description: "အနည်းဆုံး ၆ လုံး ရှိရပါမည်",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "လျှို့ဝှက်နံပါတ် မကိုက်ညီပါ",
        description: "လျှို့ဝှက်နံပါတ်များ တူညီရပါမည်",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert phone to valid email format
      const email = `phone_${formData.phone}@lottery.mm`;
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast({
            title: "အကောင့် ရှိနေပါပြီး",
            description: "ဤဖုန်းနံပါတ် ဖြင့် အကောင့်ဖွင့်ပြီးပါပြီး",
            variant: "destructive",
          });
        } else {
          toast({
            title: "အကောင့်ဖွင့်ရန် မအောင်မြင်ပါ",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: "🎉 အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်",
          description: "အကောင့်ဝင်ရောက်နိုင်ပါပြီ",
        });
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "အကောင့်ဖွင့်ရန် မအောင်မြင်ပါ",
        description: "ပြန်လည်ကြိုးစားပါ သို့မဟုတ် Admin နှင့်ဆက်သွယ်ပါ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="lottery-card rounded-2xl shadow-card max-w-md w-full overflow-hidden">
        {/* Registration Header */}
        <div className="bg-gradient-accent p-8 text-white text-center">
          <div className="text-5xl mb-4 animate-lottery-bounce">📝</div>
          <h1 className="text-3xl font-bold mb-2">အကောင့်အသစ်ဖွင့်ရန်</h1>
          <p className="opacity-90 text-lg">Myanmar 2D Lottery</p>
        </div>
        
        {/* Registration Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">👤 နာမည်</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="သင့်နာမည် ထည့်ပါ"
                className="mt-2 h-12 text-lg border-2 focus:border-accent"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label className="text-base font-medium">📱 ဖုန်းနံပါတ်</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="09xxxxxxxxx"
                className="mt-2 h-12 text-lg border-2 focus:border-accent"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground mt-1">
                ဥပမာ: 09123456789
              </p>
            </div>
            
            <div>
              <Label className="text-base font-medium">🔑 လျှို့ဝှက်နံပါတ်</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="အနည်းဆုံး ၆ လုံး"
                className="mt-2 h-12 text-lg border-2 focus:border-accent"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label className="text-base font-medium">🔒 လျှို့ဝှက်နံပါတ် အတည်ပြု</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="လျှို့ဝှက်နံပါတ် ပြန်ထည့်ပါ"
                className="mt-2 h-12 text-lg border-2 focus:border-accent"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-4">
              <Button 
                type="submit"
                variant="lottery"
                size="xl"
                className="w-full text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "⏳ အကောင့်ဖွင့်နေသည်..." : "🚀 အကောင့်ဖွင့်မည်"}
              </Button>
              
              <Button 
                type="button"
                variant="lottery-outline"
                onClick={onBack}
                className="w-full"
                disabled={isSubmitting}
              >
                ⬅️ ပြန်သွားမည်
              </Button>
            </div>
          </form>
          
          {/* Terms */}
          <Card className="mt-8 bg-muted/10 border-muted/30 p-4">
            <p className="text-sm text-muted-foreground text-center">
              အကောင့်ဖွင့်ခြင်းအားဖြင့် သင်သည် ကျွန်ုပ်တို့၏ 
              <span className="text-primary font-medium"> စည်းမျဉ်းများ</span> နှင့် 
              <span className="text-primary font-medium"> ကိုယ်ရေးကိုယ်တာမူဝါဒ</span> ကို 
              သဘောတူပါသည်။
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
};