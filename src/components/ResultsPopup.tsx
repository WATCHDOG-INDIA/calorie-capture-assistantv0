
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, Cookie, Beef, Droplet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ResultsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
}

const ResultsPopup: React.FC<ResultsPopupProps> = ({
  isOpen,
  onClose,
  nutrition,
  imageUrl
}) => {
  const navigate = useNavigate();

  const saveMealAnalysis = async () => {
    try {
      const { error } = await supabase
        .from('meal_analysis_history')
        .insert({
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          image_url: imageUrl,
          user_id: 'anonymous' // Use anonymous user_id since we removed auth
        });

      if (error) {
        console.error('Error saving meal analysis:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save meal analysis.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Meal analysis saved successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const handleDone = async () => {
    await saveMealAnalysis();
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl">
        <DialogTitle className="sr-only">Meal Analysis Results</DialogTitle>
        {imageUrl && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={imageUrl}
              alt="Food"
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="p-6 space-y-6">
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
            onClick={handleDone}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsPopup;
