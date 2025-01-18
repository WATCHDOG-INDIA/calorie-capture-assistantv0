import React, { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NutritionCard from '@/components/NutritionCard';
import { analyzeImage } from '@/lib/gemini';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<Tables<'meal_analysis_history'>[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      navigate('/auth');
    }
  };

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

  const saveAnalysis = async (imageUrl: string, nutrition: NutritionInfo) => {
    const { error } = await supabase
      .from('meal_analysis_history')
      .insert({
        image_url: imageUrl,
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
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      
      const nutrition = await analyzeImage(file);
      setNutritionInfo(nutrition);
      
      await saveAnalysis(imageUrl, nutrition);
      
      toast({
        title: "Analysis Complete",
        description: "Your meal has been analyzed and saved successfully!",
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Meal Nutrition Analyzer
          </h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <div className="space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          
          {selectedImage && (
            <Card className="p-4">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </Card>
          )}
          
          {isAnalyzing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing your meal...</p>
            </div>
          )}
          
          {nutritionInfo && !isAnalyzing && (
            <div className="flex justify-center">
              <NutritionCard nutrition={nutritionInfo} />
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Analysis History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <Card key={item.id} className="p-4 space-y-4">
                    <img
                      src={item.image_url}
                      alt="Historical meal"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <NutritionCard
                      nutrition={{
                        calories: item.calories || 0,
                        protein: item.protein || 0,
                        carbs: item.carbs || 0,
                        fat: item.fat || 0,
                      }}
                    />
                    <p className="text-sm text-gray-500">
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
