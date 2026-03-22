import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

export async function generateHealthAssessment(childData: {
  name: string;
  age: string;
  gender: string;
  growthRecords: Array<{ date: string; weightKg?: number | null; heightCm?: number | null; headCircumferenceCm?: number | null; bmi?: number | null }>;
  nutritionRecords: Array<{ date: string; mealType: string; totalCalories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null }>;
  allergies: string[];
  chronicConditions: string[];
  familyMedicalHistory: string[];
}) {
  const prompt = `You are an expert pediatric health analyst AI. Analyze the following child health data and provide a comprehensive health assessment.

Child Information:
- Name: ${childData.name}
- Age: ${childData.age}
- Gender: ${childData.gender}
- Known Allergies: ${childData.allergies.length > 0 ? childData.allergies.join(", ") : "None"}
- Chronic Conditions: ${childData.chronicConditions.length > 0 ? childData.chronicConditions.join(", ") : "None"}
- Family Medical History: ${childData.familyMedicalHistory.length > 0 ? childData.familyMedicalHistory.join(", ") : "None"}

Recent Growth Records (last 10):
${JSON.stringify(childData.growthRecords.slice(-10), null, 2)}

Recent Nutrition Records (last 14 days):
${JSON.stringify(childData.nutritionRecords.slice(-14), null, 2)}

Provide your response in the following JSON format:
{
  "summary": "A 2-3 sentence overall health summary",
  "riskLevel": "low|moderate|high",
  "findings": [
    { "category": "growth|nutrition|development|risk", "finding": "description", "severity": "normal|mild|moderate|severe" }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Important: Only return valid JSON. Be specific and actionable in recommendations. Consider WHO growth standards for the child's age and gender.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]) as {
    summary: string;
    riskLevel: string;
    findings: Array<{ category: string; finding: string; severity: string }>;
    recommendations: string[];
  };
}

export async function generateMealSuggestions(childData: {
  age: string;
  allergies: string[];
  dietaryRestrictions?: string[];
  recentMeals: string[];
}) {
  const prompt = `You are a pediatric nutritionist AI. Suggest age-appropriate meals for this child.

Child Age: ${childData.age}
Allergies: ${childData.allergies.length > 0 ? childData.allergies.join(", ") : "None"}
Dietary Restrictions: ${childData.dietaryRestrictions?.join(", ") || "None"}
Recent Meals: ${childData.recentMeals.join(", ")}

Provide 5 meal suggestions in this JSON format:
{
  "suggestions": [
    {
      "mealType": "breakfast|lunch|dinner|snack",
      "name": "meal name",
      "description": "brief description",
      "estimatedCalories": 300,
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ]
}

Only return valid JSON.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}

export async function generateWeeklySummary(childData: {
  name: string;
  weeklyGrowth: Array<{ date: string; weightKg?: number | null; heightCm?: number | null }>;
  weeklyNutrition: Array<{ date: string; totalCalories?: number | null }>;
  alerts: string[];
}) {
  const prompt = `Generate a brief weekly health summary for ${childData.name}.

Growth Data: ${JSON.stringify(childData.weeklyGrowth)}
Nutrition Data: ${JSON.stringify(childData.weeklyNutrition)}
Alerts This Week: ${childData.alerts.length > 0 ? childData.alerts.join(", ") : "None"}

Provide a concise, parent-friendly summary (3-4 sentences) with any key observations and one actionable tip. Return as JSON:
{
  "summary": "the summary text",
  "keyObservation": "main observation",
  "tip": "actionable tip"
}

Only return valid JSON.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}
