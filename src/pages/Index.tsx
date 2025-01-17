import React, { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import NutritionCard from '@/components/NutritionCard';
import { analyzeImage } from '@/lib/gemini';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

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

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setSelectedImage(URL.createObjectURL(file));
      
      const nutrition = await analyzeImage(file);
      setNutritionInfo(nutrition);
      
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          Meal Nutrition Analyzer
        </h1>
        
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
        </div>
      </div>
    </div>
  );
};

export default Index;