import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {nutrition.calories} calories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Protein</span>
            <span>{nutrition.protein}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.protein)} className="bg-blue-100" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Carbs</span>
            <span>{nutrition.carbs}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.carbs)} className="bg-green-100" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Fat</span>
            <span>{nutrition.fat}g</span>
          </div>
          <Progress value={calculatePercentage(nutrition.fat)} className="bg-yellow-100" />
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCard;