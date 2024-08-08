import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { SupabaseAuthProvider } from "./integrations/supabase/auth";
import { useState, useEffect } from 'react';
import { supabase } from './integrations/supabase';
import LoginModal from './components/LoginModal';

const queryClient = new QueryClient();

const App = () => {
  const [balances, setBalances] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (data && data.balance) {
          try {
            const parsedBalances = JSON.parse(data.balance);
            setBalances(parsedBalances || {});
          } catch (e) {
            console.error('Error parsing balances:', e);
            setBalances({});
          }
        } else {
          setBalances({});
        }
      } else {
        setBalances({});
      }
    };

    fetchBalances();

    const authListener = supabase.auth.onAuthStateChange(() => {
      fetchBalances();
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
                <Route key={to} path={to} element={React.createElement(page, { balances, setShowLoginModal })} />
              ))}
            </Routes>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
