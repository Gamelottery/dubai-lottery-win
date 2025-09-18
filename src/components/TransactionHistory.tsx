import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  created_at: string;
}

interface Bet {
  id: string;
  number: string;
  amount: number;
  draw_time: string;
  status: string;
  winning_amount: number;
  created_at: string;
}

interface TransactionHistoryProps {
  userId: string;
}

export const TransactionHistory = ({ userId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch bets
      const { data: betData, error: betError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (betError) throw betError;

      setTransactions(transactionData || []);
      setBets(betData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('my-MM', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>မှတ်တမ်းများ</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">ငွေလွှဲမှတ်တမ်း</TabsTrigger>
            <TabsTrigger value="bets">လောင်းကစားမှတ်တမ်း</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>အမျိုးအစား</TableHead>
                  <TableHead>ပမာណ</TableHead>
                  <TableHead>နည်းလမ်း</TableHead>
                  <TableHead>အခြေအနေ</TableHead>
                  <TableHead>ရက်စွဲ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      မှတ်တမ်းမရှိပါ
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                          {transaction.type === 'deposit' ? 'ငွေသွင်း' : 'ငွေထုတ်'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} ကျပ်
                      </TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' : 
                            transaction.status === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {transaction.status === 'completed' ? 'အောင်မြင်' : 
                           transaction.status === 'failed' ? 'မအောင်မြင်' : 'စောင့်ဆိုင်း'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="bets" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>နံပါတ်</TableHead>
                  <TableHead>ပမာဏ</TableHead>
                  <TableHead>အချိန်</TableHead>
                  <TableHead>အခြေအနေ</TableHead>
                  <TableHead>အနိုင်ငွေ</TableHead>
                  <TableHead>ရက်စွဲ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      လောင်းကစားမှတ်တမ်းမရှိပါ
                    </TableCell>
                  </TableRow>
                ) : (
                  bets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell className="font-medium">{bet.number}</TableCell>
                      <TableCell>{bet.amount.toLocaleString()} ကျပ်</TableCell>
                      <TableCell>{bet.draw_time}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            bet.status === 'won' ? 'default' : 
                            bet.status === 'lost' ? 'destructive' : 'secondary'
                          }
                        >
                          {bet.status === 'won' ? 'အနိုင်' : 
                           bet.status === 'lost' ? 'အရှုံး' : 'စောင့်ဆိုင်း'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bet.winning_amount > 0 ? `${bet.winning_amount.toLocaleString()} ကျပ်` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(bet.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};