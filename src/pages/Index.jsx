import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { supabase } from '../integrations/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from 'lucide-react';

const Index = ({ balances = {} }) => {
  const { session, logout } = useSupabaseAuth() || {};
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [wagerAmount, setWagerAmount] = useState(10);
  const [winChance, setWinChance] = useState(50);
  const [currency, setCurrency] = useState('BTC');
  const currencies = Object.keys(balances || {});

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUsername(data.username);
      }
    }
  };
  const [serverSeed, setServerSeed] = useState('c8544bd4cf552d647175c000184329ad23af31099163601f');
  const [clientSeed, setClientSeed] = useState('bcd4wlgbdp4871fxbtzq');

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
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                  <DropdownMenuItem onClick={logout}>
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
              <label htmlFor="server-seed" className="block text-sm font-medium text-muted-foreground mb-1">Server Seed Hash:</label>
              <Input
                id="server-seed"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
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

            <Button className="w-full">Roll Dice</Button>
            <Button variant="secondary" className="w-full">End Game</Button>
          </div>
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
                {/* Add table rows here when you have data */}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
