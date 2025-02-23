
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import MacroCard from '@/components/MacroCard';
import { toast } from "@/components/ui/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDay = today.getDay();

  // Get current streak
  const { data: streakData, refetch: refetchStreak } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No streak record found, create initial record
          const { data: newStreak, error: createError } = await supabase
            .from('user_streaks')
            .insert([{ current_streak: 1 }])
            .select()
            .single();

          if (createError) throw createError;
          return newStreak;
        }
        throw error;
      }
      return data;
    },
  });

  // Update streak on app open
  useEffect(() => {
    const updateStreak = async () => {
      if (!streakData) return;

      const lastVisit = new Date(streakData.last_visit_date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset format dates to compare only dates without time
      const lastVisitDate = new Date(lastVisit.toDateString());
      const todayDate = new Date(today.toDateString());
      const yesterdayDate = new Date(yesterday.toDateString());

      if (lastVisitDate.getTime() === todayDate.getTime()) {
        // Already visited today, do nothing
        return;
      }

      let newStreak = streakData.current_streak;

      if (lastVisitDate.getTime() === yesterdayDate.getTime()) {
        // Consecutive day, increment streak
        newStreak += 1;
        toast({
          title: "Streak increased! 🔥",
          description: `You're on a ${newStreak} day streak!`,
        });
      } else if (lastVisitDate.getTime() < yesterdayDate.getTime()) {
        // Missed a day, reset streak
        newStreak = 1;
      }

      // Update streak in database
      const { error } = await supabase
        .from('user_streaks')
        .update({
          last_visit_date: todayDate.toISOString(),
          current_streak: newStreak,
        })
        .eq('id', streakData.id);

      if (error) {
        console.error('Error updating streak:', error);
        return;
      }

      refetchStreak();
    };

    updateStreak();
  }, [streakData]);
  
  // Get meals for today
  const { data: meals } = useQuery({
    queryKey: ['meals', format(today, 'yyyy-MM-dd')],
    queryFn: async () => {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { data, error } = await supabase
        .from('meal_analysis_history')
        .select('*')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);
        
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate consumed macros
  const consumedMacros = meals?.reduce((acc, meal) => ({
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
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">CaloriesCountAI</h1>
        <div className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="font-bold">{streakData?.current_streak || 0}</span>
        </div>
      </header>

      {/* Date Picker */}
      <div className="px-4 py-6">
        <div className="flex justify-between">
          {weekDays.map((day, index) => {
            const date = new Date();
            date.setDate(date.getDate() - currentDay + index);
            const isToday = index === currentDay;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  isToday ? 'text-white' : 'text-gray-500'
                }`}
              >
                <span className="text-sm">{day}</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-black' : ''
                  }`}
                >
                  <span className="text-lg">
                    {format(date, 'dd')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macros Display */}
      <div className="px-4 py-6 space-y-6">
        <Card className="p-8 text-center">
          <div className="text-6xl font-bold text-green-500 mb-2">
            {consumedMacros?.calories || 0}
          </div>
          <div className="text-gray-500">Calories consumed</div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <MacroCard
            value={consumedMacros?.protein || 0}
            label="Protein consumed"
            unit="g"
            color="red"
            icon="bolt"
          />
          <MacroCard
            value={consumedMacros?.carbs || 0}
            label="Carbs consumed"
            unit="g"
            color="brown"
            icon="dots"
          />
          <MacroCard
            value={consumedMacros?.fat || 0}
            label="Fats consumed"
            unit="g"
            color="blue"
            icon="droplet"
          />
        </div>
      </div>

      {/* Recently Eaten Section */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Recently eaten</h2>
        {meals && meals.length > 0 ? (
          <div className="space-y-4">
            {meals.map((meal) => (
              <Card key={meal.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">Meal</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meal.created_at), 'h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{meal.calories} cal</p>
                    <p className="text-sm text-gray-500">
                      P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p className="mb-2">You haven't uploaded any food</p>
            <p className="text-sm">
              Start tracking Today's meals by taking a quick pictures
            </p>
          </Card>
        )}
      </div>

      {/* Upload Button */}
      <div className="fixed bottom-8 left-0 right-0 px-4">
        <Button
          onClick={() => navigate('/analyze')}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-6"
        >
          <Camera className="w-6 h-6 mr-2" />
          Upload a photo
        </Button>
      </div>
    </div>
  );
};

export default Home;
