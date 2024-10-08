import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { supabase } from '../integrations/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const { session } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      setEmail(session.user.email);
    } else {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || !password);
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && !passwordsMatch) {
      toast({
        title: "Password mismatch",
        description: "The new passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      let updates = {};
      let hasUpdates = false;

      if (email !== session.user.email) {
        updates.email = email;
        hasUpdates = true;
      }

      if (password) {
        updates.password = password;
        hasUpdates = true;
      }

      if (!hasUpdates) {
        toast({
          title: "No changes",
          description: "No changes were made to your profile.",
          variant: "warning",
        });
        return;
      }

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      if (data) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });

        // Clear password fields after successful update
        setPassword('');
        setConfirmPassword('');

        // Update email state if it was changed
        setEmail(data.user.email);

        // Update the session
        const { data: newSession, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (newSession) {
          // Update the session in your auth context or state management
          // This depends on how you're managing the session in your app
          // For example, if you're using a context:
          // setSession(newSession.session);
        }
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full bg-card rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          {!passwordsMatch && (
            <Alert variant="destructive">
              <AlertDescription>
                The new passwords do not match. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">New Password (leave blank to keep current)</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-1">Confirm New Password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">Update Profile</Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
