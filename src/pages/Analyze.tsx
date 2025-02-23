
import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NutritionCard from '@/components/NutritionCard';
import { analyzeImage } from '@/lib/gemini';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import useSound from 'use-sound';
import { Sparkles } from 'lucide-react';

type MealHistory = Database['public']['Tables']['meal_analysis_history']['Row'];

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Analyze = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<MealHistory[]>([]);
  
  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playAnalyzing] = useSound('/sounds/analyzing.mp3');

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('meal_analysis_history')
      .select('*')
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
      await saveAnalysis(nutrition);
      
      playSuccess();
      toast({
        title: "Analysis Complete",
        description: "Your meal has been analyzed successfully!",
      });
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the image. Please try again.",
      });
      setNutritionInfo(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/lovable-uploads/042a3f0f-1c68-4000-bafa-0692bad68634.png')`,
        backgroundSize: '400px',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Semi-transparent overlay for better readability */}
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90" />
      
      {/* Content container */}
      <div className="relative max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-purple-500 animate-pulse" />
            <h1 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Caloriescount.AI
            </h1>
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-purple-500 animate-pulse" />
          </div>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 animate-fade-in delay-200">
            Discover the nutritional secrets of your meals with AI
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="transform hover:scale-105 transition-all duration-300">
            <ImageUpload onImageSelect={handleImageSelect} />
          </div>
          
          {selectedImage && (
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transform transition-all duration-500 hover:shadow-xl animate-scale-in">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
              />
            </Card>
          )}
          
          {isAnalyzing && (
            <div className="text-center animate-fade-in">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing your meal with AI magic...</p>
            </div>
          )}
          
          {nutritionInfo && !isAnalyzing && (
            <div className="flex justify-center animate-scale-in">
              <NutritionCard nutrition={nutritionInfo} />
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-16 animate-fade-in">
              <h2 className="text-3xl font-semibold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Your Meal History
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 space-y-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in"
                  >
                    <NutritionCard
                      nutrition={{
                        calories: item.calories,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                      }}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
