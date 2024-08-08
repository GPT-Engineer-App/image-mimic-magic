import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { SupabaseAuthProvider } from "./integrations/supabase/auth";
import { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase';

const queryClient = new QueryClient();

const App = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (data) {
          setBalance(data.balance);
        }
      }
    };

    fetchBalance();

    const authListener = supabase.auth.onAuthStateChange(() => {
      fetchBalance();
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {navItems.map(({ to, page }) => (
                <Route key={to} path={to} element={React.createElement(page, { balance })} />
              ))}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
