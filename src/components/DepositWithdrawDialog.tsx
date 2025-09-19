import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DepositWithdrawDialogProps {
  type: 'deposit' | 'withdrawal';
  userBalance: number;
  onSuccess: () => void;
  userId: string;
}

export const DepositWithdrawDialog = ({ type, userBalance, onSuccess, userId }: DepositWithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !method) {
      toast({
        title: "Error",
        description: "ပမာဏနှင့် နည်းလမ်းကို ရွေးချယ်ပါ",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "Error", 
        description: "ပမာဏမှန်ကန်ရန် လိုအပ်သည်",
        variant: "destructive"
      });
      return;
    }

    if (type === 'withdrawal' && numAmount > userBalance) {
      toast({
        title: "Error",
        description: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type,
          amount: numAmount,
          method,
          reference,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "အောင်မြင်ပါသည်",
        description: `${type === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်'} တောင်းဆိုချက် ပေးပို့ပြီးပါပြီ`,
      });

      setIsOpen(false);
      setAmount("");
      setMethod("");
      setReference("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "မအောင်မြင်ပါ၊ ထပ်မံကြိုးစားပါ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={type === 'deposit' ? 'default' : 'outline'}
          className="flex-1"
        >
          {type === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'deposit' ? 'ငွေသွင်းခြင်း' : 'ငွေထုတ်ခြင်း'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">ပမာဏ (ကျပ်)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ပမာဏထည့်ပါ"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">ငွေပေးချေမုစနစ်</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="နည်းလမ်းရွေးပါ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wave">Wave Pay</SelectItem>
                <SelectItem value="kpay">K Pay</SelectItem>
                <SelectItem value="cb">CB Bank</SelectItem>
                <SelectItem value="aya">AYA Bank</SelectItem>
                <SelectItem value="mab">MAB Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (ရွေးချယ်ပိုင်ခွင့်)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction ID or Phone Number"
            />
          </div>

          {type === 'withdrawal' && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  လက်ကျန်ငွေ: <span className="font-medium">{userBalance.toLocaleString()} ကျပ်</span>
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              မလုပ်တော့
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'စောင့်ပါ...' : (type === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};