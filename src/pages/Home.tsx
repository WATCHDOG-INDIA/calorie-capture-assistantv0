import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Flame, Bolt, Circle, Droplet, Check } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import MacroCard from '@/components/MacroCard';
import { toast } from "@/components/ui/use-toast";
import StreakDialog from '@/components/StreakDialog';

// Define an interface that matches the structure we need
interface UserStreak {
  id: string;
  created_at: string | null;
  last_visit_date: string;
  current_streak: number;
  weekly_checkins: any[] | null;
  message: string | null;
}

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDay = today.getDay();
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'recent'>('today');

  // Get current streak using a type assertion
  const { data: streakData, refetch: refetchStreak } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const { data: streak, error } = await supabase
        .from('meal_analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Create default streak data
          const defaultStreak = {
            current_streak: 1,
            last_visit_date: new Date().toISOString(),
            weekly_checkins: [],
            message: "Keep the flame lit every day!"
          };

          // Insert using meal_analysis_history format but store streak data
          const { data: newStreak, error: createError } = await supabase
            .from('meal_analysis_history')
            .insert([{
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              created_at: new Date().toISOString(),
              ...defaultStreak
            }])
            .select()
            .single();

          if (createError) throw createError;
          return newStreak as unknown as UserStreak;
        }
        throw error;
      }
      return streak as unknown as UserStreak;
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
          title: "🔥 Streak increased!",
          description: `You're on fire! ${newStreak} day streak!`,
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStreakDialog(true)}
            >
              View Streak
            </Button>
          ),
        });
      } else if (lastVisitDate.getTime() < yesterdayDate.getTime()) {
        // Missed a day, reset streak
        newStreak = 1;
        toast({
          variant: "destructive",
          title: "Streak Reset",
          description: "You missed a day. Let's start a new streak!",
        });
      }

      // Update streak data in the existing table
      const { error } = await supabase
        .from('meal_analysis_history')
        .update({
          created_at: todayDate.toISOString(),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
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

  // Get meals for today and recent meals
  const { data: meals } = useQuery({
    queryKey: ['meals', format(today, 'yyyy-MM-dd'), activeTab],
    queryFn: async () => {
      if (activeTab === 'today') {
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (error) throw error;
        return data || [];
      } else {
        const { data, error } = await supabase
          .from('meal_analysis_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        return data || [];
      }
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
            
            return (
              <div key={index} className="flex flex-col items-center">
                <span className="text-sm text-gray-500">{day}</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full 
                    ${isToday ? 'bg-black text-white dark:bg-white dark:text-black' : ''}
                    ${isCheckedIn ? 'bg-orange-500/20' : ''}
                  `}
                >
                  <span className="text-lg">
                    {format(date, 'dd')}
                  </span>
                  {isCheckedIn && <Check className="w-4 h-4 absolute text-orange-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-2 px-1 ${
              activeTab === 'today'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`pb-2 px-1 ${
              activeTab === 'recent'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            Recently Added
          </button>
        </div>
      </div>

      {/* Macros Display */}
      <div className="px-4 py-6 space-y-6">
        <Card className="p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 transform group-hover:scale-105 transition-transform duration-300" />
          <div className="relative">
            <div className="text-6xl font-bold text-green-500 mb-2 animate-pulse">
              {consumedMacros?.calories || 0}
            </div>
            <div className="text-gray-500">Calories consumed</div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <MacroCard
            value={consumedMacros?.protein || 0}
            label="Protein"
            unit="g"
            color="red"
            icon="bolt"
          />
          <MacroCard
            value={consumedMacros?.carbs || 0}
            label="Carbs"
            unit="g"
            color="yellow"
            icon="dots"
          />
          <MacroCard
            value={consumedMacros?.fat || 0}
            label="Fats"
            unit="g"
            color="blue"
            icon="droplet"
          />
        </div>

        {activeTab === 'recent' && (
          <div className="space-y-4">
            {meals?.map((meal) => (
              <Card key={meal.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{format(new Date(meal.created_at), 'MMM dd, HH:mm')}</div>
                    <div className="text-sm text-gray-500">
                      {meal.calories} cal · {meal.protein}g protein · {meal.carbs}g carbs · {meal.fat}g fat
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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
