import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DepositWithdrawDialogProps {
  type: 'deposit' | 'withdrawal';
  userBalance: number;
  onSuccess: () => void;
  userId: string;
  children?: React.ReactNode;
}

export const DepositWithdrawDialog = ({ type, userBalance, onSuccess, userId, children }: DepositWithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "မှားယွင်းသော ဖိုင်အမျိုးအစား",
          description: "ပုံဖိုင်များသာ အတင်နိုင်ပါသည်",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ဖိုင်အရွယ် အကြီးလွန်းပါသည်",
          description: "၅MB ထက် မကျော်လွန်ရပါ",
          variant: "destructive",
        });
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const uploadReceiptImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Error in upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on type
    if (type === 'withdrawal') {
      if (!amount || !phone) {
        toast({
          title: "လိုအပ်သော အချက်အလက်များ မရှိပါ",
          description: "ငွေပမာဏနှင့် ဖုန်းနံပါတ် ဖြည့်ပါ",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!amount || !method) {
        toast({
          title: "လိုအပ်သော အချက်အလက်များ မရှိပါ",
          description: "ငွေပမာဏနှင့် နည်းလမ်း ရွေးချယ်ပါ",
          variant: "destructive",
        });
        return;
      }
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "မှားယွင်းသော ငွေပမာဏ",
        description: "ငွေပမာဏ သုညထက် ကြီးရပါမည်",
        variant: "destructive",
      });
      return;
    }

    if (type === 'withdrawal' && numAmount > userBalance) {
      toast({
        title: "လက်ကျန်ငွေ မလုံလောက်ပါ",
        description: "ထုတ်မည့် ငွေပမာဏ လက်ကျန်ငွေထက် မကျော်လွန်ရပါ",
        variant: "destructive",
      });
      return;
    }

    if (type === 'deposit' && !receiptFile) {
      toast({
        title: "ပြေစာပုံ လိုအပ်ပါသည်",
        description: "ငွေပေးချေမှုပြေစာ ပုံကို တင်ပါ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let receiptUrl = null;
      
      if (receiptFile) {
        receiptUrl = await uploadReceiptImage(receiptFile);
        if (!receiptUrl) {
          toast({
            title: "ပြေစာပုံ တင်ရန် မအောင်မြင်ပါ",
            description: "ပြန်လည်ကြိုးစားပါ",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type,
          amount: numAmount,
          method: type === 'withdrawal' ? null : method,
          reference: type === 'withdrawal' ? phone : (reference || ''),
          receipt_url: receiptUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "အောင်မြင်ပါသည်",
        description: `${type === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်'} တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ`,
      });

      setIsOpen(false);
      setAmount("");
      setMethod("");
      setReference("");
      setPhone("");
      setReceiptFile(null);
      onSuccess();
    } catch (error) {
      toast({
        title: "မအောင်မြင်ပါ",
        description: "ပြန်လည်ကြိုးစားပါ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant={type === 'deposit' ? 'default' : 'outline'}
            className="flex-1"
          >
            {type === 'deposit' ? '💰 ငွေသွင်း' : '💸 ငွေထုတ်'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {type === 'deposit' ? '💰 ငွေသွင်းခြင်း' : '💸 ငွေထုတ်ခြင်း'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">💵 ပမာဏ (ကျပ်)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ပမာဏထည့်ပါ"
              min="1"
              className="h-12 text-lg"
            />
          </div>

          {type === 'withdrawal' ? (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">📱 ဖုန်းနံပါတ်</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="h-12 text-lg"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="method" className="text-base font-medium">📱 ငွေပေးချေမုစနစ်</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="နည်းလမ်း ရွေးပါ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kpay">KPay - 09123456789</SelectItem>
                    <SelectItem value="wavepay">Wave Pay - 09987654321</SelectItem>
                    <SelectItem value="cbpay">CB Pay - 09456789123</SelectItem>
                    <SelectItem value="ayapay">AYA Pay - 09789123456</SelectItem>
                    <SelectItem value="bank">ဘဏ်လွဲ - CB Bank (၁၂၃၄၅)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base font-medium">🔢 ရည်ညွှန်းနံပါတ် (ရွေးချယ်ရန်)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="လုပ်ငန်းဆောင်တာ နံပါတ်"
                  className="h-12"
                />
              </div>
            </>
          )}

          {type === 'deposit' && (
            <div className="space-y-3">
              <Label htmlFor="receipt" className="text-base font-medium text-primary">
                📷 ငွေပေးချေမှု ပြေစာပုံ *
              </Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="h-12"
              />
              {receiptFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                ငွေပေးချေမှုပြေစာပုံကို တင်ပါ (အများဆုံး ၅MB)
              </p>
            </div>
          )}

          {method && (
            <Card className="bg-info/10 border-info/30">
              <CardContent className="pt-4">
                <h4 className="font-medium text-info mb-3">💳 ငွေပေးချေရန် အချက်အလက်:</h4>
                <div className="text-sm space-y-2">
                  {method === 'kpay' && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="font-medium">KPay</p>
                      <p>📱 09123456789</p>
                      <p>👤 Myanmar 2D Lottery Admin</p>
                    </div>
                  )}
                  {method === 'wavepay' && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="font-medium">Wave Pay</p>
                      <p>📱 09987654321</p>
                      <p>👤 Myanmar 2D Lottery Admin</p>
                    </div>
                  )}
                  {method === 'cbpay' && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="font-medium">CB Pay</p>
                      <p>📱 09456789123</p>
                      <p>👤 Myanmar 2D Lottery Admin</p>
                    </div>
                  )}
                  {method === 'ayapay' && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="font-medium">AYA Pay</p>
                      <p>📱 09789123456</p>
                      <p>👤 Myanmar 2D Lottery Admin</p>
                    </div>
                  )}
                  {method === 'bank' && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="font-medium">CB Bank</p>
                      <p>🏦 Account: 12345-67890-123</p>
                      <p>👤 Name: Myanmar 2D Lottery</p>
                      <p>🏢 Branch: Yangon Main</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {type === 'withdrawal' && (
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  💰 လက်ကျန်ငွေ: <span className="font-medium text-lg text-primary">{userBalance.toLocaleString()} ကျပ်</span>
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-12"
              disabled={isLoading}
            >
              ❌ မလုပ်တော့
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-lg"
              variant="lottery"
            >
              {isLoading 
                ? '⏳ ပြင်ဆင်နေသည်...' 
                : type === 'deposit' 
                  ? '💰 ငွေသွင်းမည်' 
                  : '💸 ငွေထုတ်မည်'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};