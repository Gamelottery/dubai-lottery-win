import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  receipt_url: string | null;
  created_at: string;
  profiles?: {
    name: string;
    phone: string;
  };
}

interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  user_type: string;
}

export const AdminPanel = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'results' | 'bets'>('transactions');
  const [newResult, setNewResult] = useState({ draw_time: '', result_number: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [bets, setBets] = useState<any[]>([]);
  const [editingBalance, setEditingBalance] = useState<{userId: string, newBalance: number} | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
    fetchBets();
  }, []);

  const fetchTransactions = async () => {
    try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            profiles!inner(name, phone)
          `)
          .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          profiles!inner(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateTransactionStatus = async (id: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // If approved, update user balance
      if (status === 'completed') {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
          const balanceChange = transaction.type === 'deposit' 
            ? transaction.amount 
            : -transaction.amount;

          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('user_id', transaction.user_id)
            .single();

          if (currentProfile) {
            await supabase
              .from('profiles')
              .update({ 
                balance: currentProfile.balance + balanceChange
              })
              .eq('user_id', transaction.user_id);
          }
        }
      }

      toast({
        title: "အောင်မြင်ပါသည်",
        description: "Transaction status updated successfully"
      });

      fetchTransactions();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "အောင်မြင်ပါသည်",
        description: "User balance updated successfully"
      });

      fetchUsers();
      setEditingBalance(null);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update user balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processBetWinning = async (betId: string, isWinner: boolean) => {
    setIsLoading(true);
    try {
      const bet = bets.find(b => b.id === betId);
      if (!bet) return;

      const winningAmount = isWinner ? bet.amount * 80 : 0; // 80x payout
      
      // Update bet status and winning amount
      const { error: betError } = await supabase
        .from('bets')
        .update({ 
          status: isWinner ? 'won' : 'lost',
          winning_amount: winningAmount
        })
        .eq('id', betId);

      if (betError) throw betError;

      // If winner, update user balance
      if (isWinner) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', bet.user_id)
          .single();

        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              balance: currentProfile.balance + winningAmount
            })
            .eq('user_id', bet.user_id);
        }
      }

      toast({
        title: "အောင်မြင်ပါသည်",
        description: `Bet marked as ${isWinner ? 'winner' : 'loser'} successfully`
      });

      fetchBets();
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bet result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLotteryResult = async () => {
    if (!newResult.draw_time || !newResult.result_number) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('lottery_results')
        .insert({
          draw_time: newResult.draw_time,
          result_number: newResult.result_number
        });

      if (error) throw error;

      toast({
        title: "အောင်မြင်ပါသည်",
        description: "Lottery result added successfully"
      });

      setNewResult({ draw_time: '', result_number: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lottery result",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'transactions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              Users
            </Button>
            <Button
              variant={activeTab === 'bets' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bets')}
            >
              Bets Management
            </Button>
            <Button
              variant={activeTab === 'results' ? 'default' : 'outline'}
              onClick={() => setActiveTab('results')}
            >
              Lottery Results
            </Button>
          </div>

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Transactions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>ပြေစာ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.profiles?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{transaction.profiles?.phone || 'No phone'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type === 'deposit' ? '💰 ငွေသွင်း' : '💸 ငွေထုတ်'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{transaction.amount.toLocaleString()} ကျပ်</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{transaction.method}</p>
                          {transaction.reference && (
                            <p className="text-muted-foreground text-xs">Ref: {transaction.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.receipt_url ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="h-4 w-4" />
                                ကြည့်မယ်
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>ငွေပေးချေမှု ပြေစာ</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4">
                                <img 
                                  src={`${supabase.storage.from('receipts').getPublicUrl(transaction.receipt_url).data.publicUrl}`}
                                  alt="Payment Receipt"
                                  className="w-full h-auto rounded-lg border"
                                />
                                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                                  <p><strong>အမည်:</strong> {transaction.profiles?.name}</p>
                                  <p><strong>ဖုန်း:</strong> {transaction.profiles?.phone}</p>
                                  <p><strong>ပမာဏ:</strong> {transaction.amount.toLocaleString()} ကျပ်</p>
                                  <p><strong>နည်းလမ်း:</strong> {transaction.method}</p>
                                  {transaction.reference && <p><strong>ရည်ညွှန်း:</strong> {transaction.reference}</p>}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {transaction.status === 'completed' ? '✅ အတည်ပြု' : 
                           transaction.status === 'failed' ? '❌ ပယ်ချ' : '⏳ စောင့်ဆိုင်း'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              disabled={isLoading}
                            >
                              ✅ အတည်ပြု
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                              disabled={isLoading}
                            >
                              ❌ ပယ်ချ
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Users Management</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {editingBalance?.userId === user.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              value={editingBalance.newBalance}
                              onChange={(e) => setEditingBalance({
                                userId: user.id,
                                newBalance: parseFloat(e.target.value) || 0
                              })}
                              className="w-24"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => updateUserBalance(user.id, editingBalance.newBalance)}
                              disabled={isLoading}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingBalance(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{user.balance.toLocaleString()} ကျပ်</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBalance({userId: user.id, newBalance: user.balance})}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.user_type === 'admin' ? 'destructive' : user.user_type === 'vip' ? 'default' : 'secondary'}>
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBalance({userId: user.id, newBalance: user.balance})}
                        >
                          Edit Balance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'bets' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bets Management</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Draw Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Winning Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bet.profiles?.name}</p>
                          <p className="text-sm text-muted-foreground">{bet.profiles?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{bet.number}</Badge>
                      </TableCell>
                      <TableCell>{bet.amount.toLocaleString()} ကျပ်</TableCell>
                      <TableCell>{bet.draw_time}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            bet.status === 'won' ? 'default' : 
                            bet.status === 'lost' ? 'destructive' : 'secondary'
                          }
                        >
                          {bet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bet.winning_amount ? `${bet.winning_amount.toLocaleString()} ကျပ်` : '-'}
                      </TableCell>
                      <TableCell>
                        {bet.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => processBetWinning(bet.id, true)}
                              disabled={isLoading}
                            >
                              Winner
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processBetWinning(bet.id, false)}
                              disabled={isLoading}
                            >
                              Loser
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Lottery Result</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="draw_time">Draw Time</Label>
                  <Input
                    id="draw_time"
                    value={newResult.draw_time}
                    onChange={(e) => setNewResult({...newResult, draw_time: e.target.value})}
                    placeholder="e.g., 12:01 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="result_number">Result Number</Label>
                  <Input
                    id="result_number"
                    value={newResult.result_number}
                    onChange={(e) => setNewResult({...newResult, result_number: e.target.value})}
                    placeholder="e.g., 45"
                  />
                </div>
              </div>
              <Button onClick={addLotteryResult} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Result'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};