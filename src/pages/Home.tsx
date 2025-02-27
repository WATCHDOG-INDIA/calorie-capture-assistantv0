import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Flame, Check } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import MacroCard from '@/components/MacroCard';
import StreakDialog from '@/components/StreakDialog';

// Define types explicitly
type UserStreak = {
  id: string;
  created_at: string;
  last_visit_date: string;
  current_streak: number;
  weekly_checkins: string[];
  message: string | null;
  user_id: string;
};

type MealData = {
  id: string;
  created_at: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  user_id: string;
};

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDay = today.getDay();
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'recent'>('today');

  // Fetch streak data without auth
  const fetchStreak = async () => {
    const { data: streak, error } = await supabase
      .from('user_streaks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!streak) {
      const defaultStreak = {
        current_streak: 1,
        last_visit_date: new Date().toISOString(),
        weekly_checkins: [],
        message: "Keep the flame lit every day!",
        user_id: 'anonymous'
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
  };

  // Use queries
  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak
  });

  const { data: meals = [] } = useQuery<MealData[]>({
    queryKey: ['meals', format(today, 'yyyy-MM-dd'), activeTab],
    queryFn: async () => {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      if (activeTab === 'today') {
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (error) throw error;
        return (data || []) as MealData[];
      } else {
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        return (data || []) as MealData[];
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">CaloriesCountAI</h1>
        <button
          onClick={() => setShowStreakDialog(true)}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <span className="font-bold text-xl">{streakData?.current_streak || 0}</span>
        </button>
      </header>

      {/* Date Picker */}
      <div className="px-4 py-6">
        <div className="flex justify-between">
          {weekDays.map((day, index) => {
            const date = new Date();
            date.setDate(date.getDate() - currentDay + index);
            const isToday = index === currentDay;
            const isCheckedIn = streakData?.weekly_checkins?.includes(
              format(date, 'yyyy-MM-dd')
            );
            const isInStreak = index <= currentDay && isCheckedIn;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <span className="text-sm text-gray-500">{day}</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full relative
                    ${isToday ? 'bg-black text-white dark:bg-white dark:text-black' : ''}
                    ${isInStreak ? 'bg-orange-500/20' : ''}
                  `}
                >
                  <span className="text-lg">
                    {format(date, 'dd')}
                  </span>
                  {isInStreak && (
                    <Check className="absolute w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macros Display */}
      <div className="px-4 py-6 space-y-6">
        <Card className="p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 transform group-hover:scale-105 transition-transform duration-300" />
          <div className="relative">
            <div className="text-6xl font-bold text-green-500 mb-2 animate-pulse">
              {meals.reduce((total, meal) => total + (meal.calories || 0), 0)}
            </div>
            <div className="text-gray-500">Calories consumed</div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <MacroCard
            value={meals.reduce((total, meal) => total + (meal.protein || 0), 0)}
            label="Protein"
            unit="g"
            color="red"
            icon="bolt"
          />
          <MacroCard
            value={meals.reduce((total, meal) => total + (meal.carbs || 0), 0)}
            label="Carbs"
            unit="g"
            color="yellow"
            icon="dots"
          />
          <MacroCard
            value={meals.reduce((total, meal) => total + (meal.fat || 0), 0)}
            label="Fats"
            unit="g"
            color="blue"
            icon="droplet"
          />
        </div>

        {/* Recently Added Meals */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Today's Meals</h2>
          {meals.map((meal) => (
            <Card key={meal.id} className="p-4">
              <div className="flex gap-4 items-center">
                {meal.image_url && (
                  <img 
                    src={meal.image_url} 
                    alt="Meal" 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{format(new Date(meal.created_at), 'HH:mm')}</div>
                  <div className="text-sm text-gray-500 space-x-2">
                    <span>{meal.calories} cal</span>
                    <span>•</span>
                    <span>{meal.protein}g protein</span>
                    <span>•</span>
                    <span>{meal.carbs}g carbs</span>
                    <span>•</span>
                    <span>{meal.fat}g fat</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {meals.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No meals logged today
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => navigate('/analyze')}
          className="rounded-full w-16 h-16 bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <Camera className="w-8 h-8" />
        </Button>
      </div>

      {/* Streak Dialog */}
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
