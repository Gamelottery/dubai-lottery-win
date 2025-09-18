import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'results'>('transactions');
  const [newResult, setNewResult] = useState({ draw_time: '', result_number: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.user_id}</p>
                          <p className="text-sm text-muted-foreground">User ID</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.amount.toLocaleString()} ကျပ်</TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              disabled={isLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateTransactionStatus(transaction.id, 'failed')}
                              disabled={isLoading}
                            >
                              Reject
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
              <h3 className="text-lg font-semibold">Users</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.balance.toLocaleString()} ကျပ်</TableCell>
                      <TableCell>
                        <Badge variant={user.user_type === 'admin' ? 'destructive' : user.user_type === 'vip' ? 'default' : 'secondary'}>
                          {user.user_type}
                        </Badge>
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