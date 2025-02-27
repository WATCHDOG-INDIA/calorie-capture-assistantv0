import { GoogleGenerativeAI } from "@google/generative-ai";

async function getGeminiKey() {
  // Note: In a production environment, never store API keys directly in code
  return 'AIzaSyB4__ffqIVlqVS2G6khGZPWMAzcdH13NAo';
}

export async function analyzeImage(file: File): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  try {
    const apiKey = await getGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Changed to use gemini-1.5-flash model as recommended by Google
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageData = await fileToGenerativePart(file);
    const prompt = "You are a nutritionist analyzing this food image. Provide ONLY a valid JSON object with these exact numeric keys: calories, protein, carbs, fat (all as numbers). Example: {\"calories\": 300, \"protein\": 20, \"carbs\": 30, \"fat\": 10}. No other text or explanation.";

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini response:", text);
    
    try {
      // Try to parse the entire response as JSON first
      const nutrition = JSON.parse(text);
      if (isValidNutritionObject(nutrition)) {
        return nutrition;
      }
    } catch (e) {
      // If direct parsing fails, try to find a JSON object in the text
      const jsonMatch = text.match(/\{[^]*\}/);
      if (jsonMatch) {
        const nutrition = JSON.parse(jsonMatch[0]);
        if (isValidNutritionObject(nutrition)) {
          return nutrition;
        }
      }
    }
    
    throw new Error("Invalid nutrition information format received from Gemini");
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    
    // Check for specific error types
    if (error.message?.includes("503")) {
      throw new Error("The AI service is currently overloaded. Please try again in a few moments.");
    } else if (error.message?.includes("429")) {
      throw new Error("Too many requests. Please wait a moment before trying again.");
    }
    
    throw error;
  }
}

function isValidNutritionObject(obj: any): obj is {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return (
    typeof obj === 'object' &&
    typeof obj.calories === 'number' &&
    typeof obj.protein === 'number' &&
    typeof obj.carbs === 'number' &&
    typeof obj.fat === 'number'
  );
}

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64EncodedData = result.split(',')[1];
      resolve(base64EncodedData);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}