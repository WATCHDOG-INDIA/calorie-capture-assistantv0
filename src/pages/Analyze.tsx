import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NutritionCard from '@/components/NutritionCard';
import ResultsPopup from '@/components/ResultsPopup';
import { analyzeImage } from '@/lib/gemini';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import useSound from 'use-sound';
import { Sparkles, ArrowLeft, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type MealHistory = Database['public']['Tables']['meal_analysis_history']['Row'];

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Analyze = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<MealHistory[]>([]);
  
  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playAnalyzing] = useSound('/sounds/analyzing.mp3');

  const fetchHistory = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('meal_analysis_history')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analysis history.",
      });
      return;
    }

    setHistory(data || []);
  };

  const saveAnalysis = async (nutrition: NutritionInfo) => {
    const { error } = await supabase
      .from('meal_analysis_history')
      .insert({
        image_url: selectedImage || 'placeholder.svg',
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      });

    if (error) {
      console.error('Error saving analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save analysis results.",
      });
      return;
    }

    fetchHistory();
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      playAnalyzing();
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      console.log('Starting image analysis...');
      const nutrition = await analyzeImage(file);
      console.log('Analysis completed:', nutrition);
      
      setNutritionInfo(nutrition);
      setShowResults(true);
      playSuccess();
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      setNutritionInfo(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 z-10">
        <div className="max-w-4xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="absolute left-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Caloriescount.AI
              </h1>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 pb-40 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Discover the nutritional secrets of your meals with AI
        </p>

        {isAnalyzing && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing your meal with AI magic...</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Your Meal History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <Card key={item.id} className="p-4 space-y-4">
                  <NutritionCard
                    nutrition={{
                      calories: item.calories,
                      protein: item.protein,
                      carbs: item.carbs,
                      fat: item.fat,
                    }}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageSelect(file);
              };
              fileInput.click();
            }}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Image
          </Button>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.capture = 'environment';
              fileInput.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageSelect(file);
              };
              fileInput.click();
            }}
          >
            <Camera className="w-5 h-5 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      {/* Results Popup */}
      {nutritionInfo && (
        <ResultsPopup
          isOpen={showResults}
          onClose={() => {
            setShowResults(false);
            navigate('/');
          }}
          nutrition={nutritionInfo}
          imageUrl={selectedImage || undefined}
        />
      )}
    </div>
  );
};

export default Analyze;
