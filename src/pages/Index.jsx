import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { supabase } from '../integrations/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { session, logout } = useSupabaseAuth() || {};
  const [email, setEmail] = useState('');
  const [balances, setBalances] = useState({});
  const navigate = useNavigate();
  const [wagerAmount, setWagerAmount] = useState(10);
  const [winChance, setWinChance] = useState(50);
  const [currency, setCurrency] = useState('BTC');
  const currencies = Object.keys(balances);
  const { toast } = useToast();
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentBets, setRecentBets] = useState([]);
  const [betResult, setBetResult] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      setEmail(userData.email);
      if (userData.balance) {
        try {
          const parsedBalances = JSON.parse(userData.balance);
          setBalances(parsedBalances);
          if (!currency || !parsedBalances[currency]) {
            setCurrency(Object.keys(parsedBalances)[0] || 'BTC');
          }
        } catch (e) {
          console.error('Error parsing balances:', e);
          setBalances({});
        }
      }
    }
    fetchRecentBets();
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const fetchRecentBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentBets(data);
    } catch (error) {
      console.error('Error fetching recent bets:', error);
    }
  };

  const rollDice = async () => {
    setBetResult(null);
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to play.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roll-dice', {
        body: JSON.stringify({
          wagerAmount,
          winChance,
          clientSeed: clientSeed || undefined,
          currency,
        }),
      });

      if (error) throw error;

      const { result, updatedBalance, betId, payout } = data;

      // Update local balance
      setBalances(prev => ({
        ...prev,
        [currency]: updatedBalance,
      }));

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      userData.balance = JSON.stringify({
        ...JSON.parse(userData.balance),
        [currency]: updatedBalance,
      });
      localStorage.setItem('userData', JSON.stringify(userData));

      // Set bet result
      setBetResult({ result, payout });

      // Insert bet into bets table
      const { error: insertError } = await supabase
        .from('bets')
        .insert({
          user_id: session.user.id,
          wager_amount: wagerAmount,
          win_chance: winChance,
          currency: currency,
          result: result,
          payout: payout,
          client_seed: clientSeed,
          server_seed_hash: serverSeedHash,
        });

      if (insertError) throw insertError;

      toast({
        title: result ? "You won!" : "You lost",
        description: `New balance: ${updatedBalance.toFixed(4)} ${currency}`,
        variant: result ? "default" : "destructive",
      });

      // Refresh recent bets
      fetchRecentBets();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-bold">Dice Game</span>
            <a href="#" className="text-primary">Home</a>
            <a href="#" className="text-muted-foreground">Game</a>
            <a href="#" className="text-muted-foreground">Verification</a>
            <a href="#" className="text-muted-foreground">Admin</a>
            <a href="#" className="text-muted-foreground">Wallet</a>
            {!session && <a href="#" className="text-muted-foreground">Register</a>}
            {!session && <a href="/login" className="text-muted-foreground">Login</a>}
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              {session && (
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      Balance: {balances[currency]?.toFixed(4) || '0.0000'} {currency}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}: {balances[curr]?.toFixed(4) || '0.0000'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${email}`} />
                    <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Provably Fair Dice Game</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Balances:</label>
              {currencies.map((curr) => (
                <div key={curr} className="text-lg font-semibold">
                  {curr}: {balances[curr]?.toFixed(4) || '0.0000'}
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="wager-amount" className="block text-sm font-medium text-muted-foreground mb-1">Wager Amount:</label>
              <Input
                id="wager-amount"
                type="number"
                value={wagerAmount}
                onChange={(e) => setWagerAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Win Chance: {winChance}%</label>
              <Slider
                value={[winChance]}
                onValueChange={(value) => setWinChance(value[0])}
                max={100}
                step={1}
              />
            </div>

            <div>
              <label htmlFor="server-seed-hash" className="block text-sm font-medium text-muted-foreground mb-1">Server Seed Hash:</label>
              <Input
                id="server-seed-hash"
                value={serverSeedHash}
                onChange={(e) => setServerSeedHash(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label htmlFor="client-seed" className="block text-sm font-medium text-muted-foreground mb-1">Client Seed (optional):</label>
              <Input
                id="client-seed"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full"
              />
            </div>

            <Button className="w-full" onClick={rollDice} disabled={loading}>
              {loading ? 'Rolling...' : 'Roll Dice'}
            </Button>
          </div>
          
          {betResult && (
            <Alert className="mt-4" variant={betResult.result ? "default" : "destructive"}>
              <AlertTitle>{betResult.result ? "You won!" : "You lost"}</AlertTitle>
              <AlertDescription>
                Payout: {betResult.payout} {currency}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Recent Bets</h3>
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Chance</th>
                  <th className="px-4 py-2 text-left">Wager</th>
                  <th className="px-4 py-2 text-left">Result</th>
                  <th className="px-4 py-2 text-left">Payout</th>
                  <th className="px-4 py-2 text-left">Bet ID</th>
                </tr>
              </thead>
              <tbody>
                {recentBets.map((bet) => (
                  <tr key={bet.id}>
                    <td className="px-4 py-2">{bet.user_id}</td>
                    <td className="px-4 py-2">{bet.win_chance}%</td>
                    <td className="px-4 py-2">{bet.wager_amount} {bet.currency}</td>
                    <td className="px-4 py-2">{bet.result ? 'Win' : 'Loss'}</td>
                    <td className="px-4 py-2">{bet.payout} {bet.currency}</td>
                    <td className="px-4 py-2">{bet.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
