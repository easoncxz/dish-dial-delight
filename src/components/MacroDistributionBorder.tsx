import { NutritionSummary, Ingredient } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";

interface MacroDistributionBorderProps {
  nutrition?: NutritionSummary;
  ingredient?: Ingredient;
}

const MacroDistributionBorder = ({ nutrition, ingredient }: MacroDistributionBorderProps) => {
  // Convert ingredient to nutrition summary if provided
  const nutritionData: NutritionSummary | undefined = nutrition || (ingredient ? {
    calories: ingredient.calories,
    protein: ingredient.protein,
    carbs: ingredient.carbs,
    fat: ingredient.fat,
    fiber: ingredient.fiber,
    nutrients: ingredient.nutrients || {}
  } : undefined);
  
  // If no nutrition data is available, return empty border
  if (!nutritionData) {
    return <div className="absolute top-0 left-0 right-0 h-4" />;
  }
  
  const macros = calculateMacroPercentages(nutritionData);
  
  return (
    <div className="absolute top-0 left-0 right-0 h-4 flex">
      {macros.map((macro, index) => (
        macro.value > 0 ? (
          <div 
            key={index} 
            style={{ 
              width: `${macro.value}%`,
              background: `linear-gradient(to bottom, ${macro.color} 0%, transparent 100%)`
            }} 
            className="h-full"
          />
        ) : null
      ))}
    </div>
  );
};

export default MacroDistributionBorder;