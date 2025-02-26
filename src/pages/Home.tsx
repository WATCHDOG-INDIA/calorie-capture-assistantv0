
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Camera } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import type { UserStreak, MealData, MacroSummary } from '@/types/meal';
import Header from '@/components/home/Header';
import DatePicker from '@/components/home/DatePicker';
import MacrosDisplay from '@/components/home/MacrosDisplay';
import MealsList from '@/components/home/MealsList';
import StreakDialog from '@/components/StreakDialog';

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'recent'>('today');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: streak, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!streak) {
        const defaultStreak: Omit<UserStreak, 'id' | 'created_at'> = {
          current_streak: 1,
          last_visit_date: new Date().toISOString(),
          weekly_checkins: [],
          message: "Keep the flame lit every day!",
          user_id: user.id
        };

        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert([defaultStreak])
          .select()
          .single();

        if (createError) throw createError;
        return newStreak as UserStreak;
      }

      return streak as UserStreak;
    },
  });

  const { data: meals = [] } = useQuery<MealData[]>({
    queryKey: ['meals', format(today, 'yyyy-MM-dd'), activeTab],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      if (activeTab === 'today') {
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (error) throw error;
        return (data || []) as MealData[];
      } else {
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        return (data || []) as MealData[];
      }
    },
    initialData: [],
  });

  const consumedMacros: MacroSummary = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        streak={streakData?.current_streak || 0}
        onStreakClick={() => setShowStreakDialog(true)}
      />

      <DatePicker weeklyCheckins={streakData?.weekly_checkins} />

      <div className="px-4 py-6 space-y-6">
        <MacrosDisplay macros={consumedMacros} />
        <MealsList meals={meals} />
      </div>

      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => navigate('/analyze')}
          className="rounded-full w-16 h-16 bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <Camera className="w-8 h-8" />
        </Button>
      </div>

      <StreakDialog 
        isOpen={showStreakDialog}
        onClose={() => setShowStreakDialog(false)}
        streak={streakData?.current_streak || 0}
        weeklyCheckins={streakData?.weekly_checkins}
      />
    </div>
  );
};

export default Home;
