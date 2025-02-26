
import React from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import type { MealData } from '@/types/meal';

interface MealsListProps {
  meals: MealData[];
}

const MealsList: React.FC<MealsListProps> = ({ meals }) => {
  return (
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
  );
};

export default MealsList;
