import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  nutrition: NutritionInfo;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ nutrition }) => {
  const totalGrams = nutrition.protein + nutrition.carbs + nutrition.fat;
  
  const calculatePercentage = (value: number) => {
    return (value / totalGrams) * 100;
  };

  return (
    <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
            {nutrition.calories} calories
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Beef className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Protein</span>
            </div>
            <span className="font-semibold">{nutrition.protein}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.protein)} className="h-2 bg-blue-100 dark:bg-blue-950">
            <div className="h-full bg-blue-500 transition-all duration-500 ease-in-out rounded-full" />
          </Progress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-green-500" />
              <span className="font-medium">Carbs</span>
            </div>
            <span className="font-semibold">{nutrition.carbs}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.carbs)} className="h-2 bg-green-100 dark:bg-green-950">
            <div className="h-full bg-green-500 transition-all duration-500 ease-in-out rounded-full" />
          </Progress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Fat</span>
            </div>
            <span className="font-semibold">{nutrition.fat}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.fat)} className="h-2 bg-yellow-100 dark:bg-yellow-950">
            <div className="h-full bg-yellow-500 transition-all duration-500 ease-in-out rounded-full" />
          </Progress>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCard;