import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface WingoResult {
  id: string;
  draw_time: string;
  result_number: string;
  created_at: string;
}

const getNumberColor = (num: number): { bg: string; label: string; isDouble?: boolean } => {
  if ([1, 3, 7, 9].includes(num)) return { bg: 'bg-emerald-500', label: 'အစိမ်း' };
  if ([0, 5].includes(num)) return { bg: 'bg-gradient-to-r from-violet-500 to-red-500', label: 'ခရမ်း/အနီ', isDouble: true };
  return { bg: 'bg-red-500', label: 'အနီ' };
};

const getSize = (num: number): { label: string; type: 'big' | 'small' } => {
  return num >= 5 ? { label: 'အကြီး', type: 'big' } : { label: 'အသေး', type: 'small' };
};

export const WingoHistory = () => {
  const [results, setResults] = useState<WingoResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();

    // Real-time subscription
    const channel = supabase
      .channel('wingo-results')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lottery_results'
        },
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
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching Wingo results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' });
  };

  // Group results by date
  const groupedResults = results.reduce((groups, result) => {
    const date = new Date(result.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(result);
    return groups;
  }, {} as Record<string, WingoResult[]>);

  if (loading) {
    return (
      <Card className="lottery-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="lottery-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-primary p-4 text-white">
        <h2 className="text-xl font-bold text-center">📊 Wingo ရလဒ်မှတ်တမ်း</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Color Legend */}
        <div className="flex flex-wrap justify-center gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-muted-foreground">အစိမ်း (1,3,7,9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-muted-foreground">အနီ (2,4,6,8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-red-500"></div>
            <span className="text-sm text-muted-foreground">ခရမ်း (0,5)</span>
          </div>
        </div>

        {/* Latest Results Row */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">နောက်ဆုံးရလဒ်များ</h3>
            <div className="flex flex-wrap gap-2">
              {results.slice(0, 20).map((result, index) => {
                const num = parseInt(result.result_number) || 0;
                const colorInfo = getNumberColor(num);
                const sizeInfo = getSize(num);
                
                return (
                  <div 
                    key={result.id} 
                    className={`relative group ${index === 0 ? 'animate-scale-in' : ''}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${colorInfo.bg} flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform hover:scale-110 cursor-pointer`}
                    >
                      {num}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-popover text-popover-foreground text-xs rounded-lg p-2 shadow-lg whitespace-nowrap">
                        <div className="font-bold">{result.draw_time}</div>
                        <div>{colorInfo.label} • {sizeInfo.label}</div>
                        <div className="text-muted-foreground">{formatTime(result.created_at)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              label="အစိမ်း" 
              count={results.filter(r => [1,3,7,9].includes(parseInt(r.result_number) || -1)).length}
              total={results.length}
              color="bg-emerald-500"
            />
            <StatCard 
              label="အနီ" 
              count={results.filter(r => [2,4,6,8].includes(parseInt(r.result_number) || -1)).length}
              total={results.length}
              color="bg-red-500"
            />
            <StatCard 
              label="အကြီး" 
              count={results.filter(r => (parseInt(r.result_number) || 0) >= 5).length}
              total={results.length}
              color="bg-primary"
            />
            <StatCard 
              label="အသေး" 
              count={results.filter(r => (parseInt(r.result_number) || 0) < 5).length}
              total={results.length}
              color="bg-secondary"
            />
          </div>
        )}

        {/* Detailed History by Date */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedResults).map(([date, dateResults]) => (
            <div key={date} className="space-y-2">
              <div className="sticky top-0 bg-background/95 backdrop-blur py-1">
                <Badge variant="outline" className="text-xs">
                  {formatDate(dateResults[0].created_at)}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {dateResults.map((result) => {
                  const num = parseInt(result.result_number) || 0;
                  const colorInfo = getNumberColor(num);
                  const sizeInfo = getSize(num);
                  
                  return (
                    <div 
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-sm text-muted-foreground w-20">
                        {result.draw_time}
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full ${colorInfo.bg} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                      >
                        {num}
                      </div>
                      <div className="flex gap-2 flex-1">
                        <Badge 
                          className={`${colorInfo.bg} text-white border-0`}
                        >
                          {colorInfo.label}
                        </Badge>
                        <Badge 
                          variant={sizeInfo.type === 'big' ? 'default' : 'secondary'}
                        >
                          {sizeInfo.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(result.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🎰</div>
            <p>ရလဒ်မရှိသေးပါ</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const StatCard = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-1`}></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-lg">{count}</div>
      <div className="text-xs text-muted-foreground">{percentage}%</div>
    </div>
  );
};
