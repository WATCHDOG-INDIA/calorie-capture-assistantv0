
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Cookie, Beef, Droplet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NutritionState {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nutrition = location.state as NutritionState;

  if (!nutrition) {
    navigate('/analyze');
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {nutrition.imageUrl && (
        <div className="h-64 md:h-96 bg-gray-100">
          <img
            src={nutrition.imageUrl}
            alt="Food"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="max-w-md mx-auto p-6 space-y-6 -mt-8 relative">
        <div className="grid grid-cols-2 gap-4">
          {/* Carbs */}
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Cookie className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutrition.carbs}g</p>
              </div>
            </div>
          </Card>

          {/* Protein */}
          <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <Beef className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutrition.protein}g</p>
              </div>
            </div>
          </Card>

          {/* Fat */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Droplet className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutrition.fat}g</p>
              </div>
            </div>
          </Card>

          {/* Calories */}
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{nutrition.calories}</p>
              </div>
            </div>
          </Card>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default Results;
