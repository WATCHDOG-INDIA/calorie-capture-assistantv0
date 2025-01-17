import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyByz6BrqfYIpyP5J4B0HrtOqHFEIZVkJRg");

export async function analyzeImage(file: File): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageData = await fileToGenerativePart(file);
    const prompt = "Analyze this food image and provide the nutritional information. Return ONLY a JSON object with these exact keys: calories (number), protein (grams), carbs (grams), fat (grams). For example: {\"calories\": 300, \"protein\": 20, \"carbs\": 30, \"fat\": 10}";

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{.*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse nutrition information");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
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