import { useState } from "react";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { Utensils, ChefHat, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";

const INGREDIENTS = [
  "Chicken breast", "Pork chops", "Ground beef", "Eggs", "Tofu", "Salmon", 
  "Zucchini", "Spring onion", "Broccoli", "Spinach", "Bell peppers",
  "Rice", "Pasta", "Quinoa", "Sweet potato", "Black beans"
];

export function AIRecipeGenerator() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert nutritionist and meal prep chef for nurses. 
      The user wants to meal prep for the week and has the following ingredients available: ${selectedIngredients.join(', ')}.
      
      Please come up with ONE creative, healthy, muscle-building meal prep recipe using some or all of these ingredients. You can also add 1 or 2 extra common pantry ingredients to complete the dish if needed.
      
      Format the output nicely in Markdown without a main # title (start with ## for sections). Include:
      1. Recipe Name
      2. Ingredients List (highlighting what was used vs added)
      3. Brief Cooking Instructions (focusing on batch prep for multiple days)
      4. Macro estimates if possible.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (!response.text) {
        throw new Error("Failed to generate recipe. Empty response from AI.");
      }

      setRecipe(response.text);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const msg = err.message || "";
      setError(msg || "Something went wrong generating your recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-[32px] border border-[#E5E5DF] shadow-sm bg-white overflow-hidden mt-6">
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-serif italic text-[#3D3D2D] flex items-center gap-2">
              <ChefHat size={20} className="text-[#5A5A40]" />
              Smart Meal Prep
            </CardTitle>
            <p className="opacity-70 text-[#3D3D2D] text-sm mt-1">Select what you have in the fridge.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-[#FAF9F6] p-4 rounded-3xl border border-[#E5E5DF]">
          {INGREDIENTS.map((ingredient) => (
            <label key={ingredient} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#3D3D2D]">
              <Checkbox 
                checked={selectedIngredients.includes(ingredient)} 
                onCheckedChange={() => handleToggle(ingredient)}
                className="text-[#5A5A40] border-[#D1D1C7] data-[state=checked]:bg-[#5A5A40]"
              />
              {ingredient}
            </label>
          ))}
        </div>
        
        <Button 
          className="w-full rounded-2xl bg-[#5A5A40] hover:bg-[#3D3D2D] text-white py-6 flex items-center justify-center gap-2 font-semibold shadow-none"
          onClick={generateRecipe}
          disabled={loading || selectedIngredients.length === 0}
        >
          {loading ? (
            <span className="animate-pulse flex items-center gap-2"><Utensils size={18} /> Cooking up ideas...</span>
          ) : (
            <><Sparkles size={18} /> Discover New Recipe</>
          )}
        </Button>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        {recipe && (
          <div className="mt-8 p-6 bg-[#FAF9F6] rounded-3xl border border-[#E5E5DF] animate-in slide-in-from-top-4 fade-in duration-500">
            <h3 className="uppercase tracking-widest text-[10px] font-bold text-[#5A5A40] mb-4">Your Custom Formula</h3>
            <div className="markdown-body text-[#3D3D2D] text-sm font-medium leading-relaxed prose prose-stone max-w-none [&>h2]:text-lg [&>h2]:font-serif [&>h2]:italic [&>h2]:mt-6 [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1">
              <Markdown>{recipe}</Markdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
