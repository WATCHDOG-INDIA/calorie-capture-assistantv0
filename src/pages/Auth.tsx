
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pin.length !== 6) {
        toast({
          variant: "destructive",
          title: "Invalid PIN",
          description: "PIN must be exactly 6 digits",
        });
        return;
      }

      if (isSignUp) {
        // Check if username exists
        const { data: existingUser } = await supabase
          .from('app_users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          toast({
            variant: "destructive",
            title: "Username taken",
            description: "Please choose a different username",
          });
          return;
        }

        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('app_users')
          .insert({
            username,
            pin_hash: pin, // In a real app, you'd want to hash this
            last_login: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        toast({
          title: "Welcome!",
          description: "Account created successfully",
        });
      } else {
        // Login
        const { data: user, error: loginError } = await supabase
          .from('app_users')
          .select('*')
          .eq('username', username)
          .eq('pin_hash', pin)
          .single();

        if (loginError || !user) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid username or PIN",
          });
          return;
        }

        // Check if 24 hours have passed since last login
        const lastLogin = new Date(user.last_login);
        const now = new Date();
        const hoursDiff = Math.abs(now.getTime() - lastLogin.getTime()) / 36e5;

        if (hoursDiff >= 24) {
          // Update streak and last login
          const { error: updateError } = await supabase
            .from('app_users')
            .update({
              current_streak: user.current_streak + 1,
              last_login: now.toISOString(),
            })
            .eq('id', user.id);

          if (updateError) throw updateError;

          toast({
            title: "Streak increased!",
            description: `You're on a ${user.current_streak + 1} day streak!`,
          });
        } else {
          // Just update last login
          const { error: updateError } = await supabase
            .from('app_users')
            .update({
              last_login: now.toISOString(),
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
        }

        toast({
          title: "Welcome back!",
          description: `Last login: ${format(lastLogin, 'PPpp')}`,
        });
      }

      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pin" className="text-sm font-medium">
              6-Digit PIN
            </label>
            <Input
              id="pin"
              type="password"
              required
              maxLength={6}
              pattern="\d{6}"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter your 6-digit PIN"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
