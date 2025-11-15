import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface LotteryResult {
  id: string;
  draw_time: string;
  result_number: string;
  created_at: string;
}

export const LotteryResultsHistory = () => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();

    // Set up real-time subscription
    const channel = supabase
      .channel('lottery_results_history')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lottery_results' },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching lottery results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group results by date
  const groupedResults = results.reduce((acc, result) => {
    const date = format(new Date(result.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(result);
    return acc;
  }, {} as Record<string, LotteryResult[]>);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">ထီရလဒ် မှတ်တမ်း</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResults).map(([date, dayResults]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  {format(new Date(date), 'dd/MM/yyyy')}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>အချိန်</TableHead>
                      <TableHead>ထွက်ဂဏန်း</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayResults
                      .sort((a, b) => a.draw_time.localeCompare(b.draw_time))
                      .map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.draw_time}
                          </TableCell>
                          <TableCell>
                            <span className="text-xl font-bold text-[#FFD700]">
                              {result.result_number}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ))}
            {Object.keys(groupedResults).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                ရလဒ်များ မရှိသေးပါ
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
