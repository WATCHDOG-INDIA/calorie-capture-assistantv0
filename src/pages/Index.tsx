import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NutritionCard from '@/components/NutritionCard';
import { analyzeImage } from '@/lib/gemini';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import useSound from 'use-sound';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<Tables<'meal_analysis_history'>[]>([]);
  
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

    setHistory(data);
  };

  const saveAnalysis = async (nutrition: NutritionInfo) => {
    const { error } = await supabase
      .from('meal_analysis_history')
      .insert({
        image_url: 'placeholder.svg', // Using a placeholder instead of actual image
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
      
      const nutrition = await analyzeImage(file);
      setNutritionInfo(nutrition);
      
      await saveAnalysis(nutrition);
      
      playSuccess();
      toast({
        title: "Analysis Complete",
        description: "Your meal has been analyzed successfully!",
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze the image. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            BE.FIT.AI
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Intelligent Meal Nutrition Analysis
          </p>
        </div>
        
        <div className="space-y-8 animate-fade-in">
          <ImageUpload onImageSelect={handleImageSelect} />
          
          {selectedImage && (
            <Card className="p-6 transform transition-all duration-500 hover:shadow-lg animate-scale-in">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </Card>
          )}
          
          {isAnalyzing && (
            <div className="text-center animate-fade-in">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing your meal...</p>
            </div>
          )}
          
          {nutritionInfo && !isAnalyzing && (
            <div className="flex justify-center animate-scale-in">
              <NutritionCard nutrition={nutritionInfo} />
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-12 animate-fade-in">
              <h2 className="text-3xl font-semibold mb-6 text-center">Analysis History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 space-y-4 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <NutritionCard
                      nutrition={{
                        calories: item.calories || 0,
                        protein: item.protein || 0,
                        carbs: item.carbs || 0,
                        fat: item.fat || 0,
                      }}
                    />
                    <p className="text-sm text-gray-500 text-center">
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

export default Index;