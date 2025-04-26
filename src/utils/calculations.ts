import { Dish, Ingredient, NutritionSummary, NutrientMap } from '@/types';

// Calculate the nutrition for a specific amount of an ingredient
export const calculateIngredientNutrition = (
  ingredient: Ingredient,
  amount: number // in grams
): NutritionSummary => {
  // Convert from the base 100g to the specified amount
  const ratio = amount / 100;
  
  // Create a copy of the nutrients map with adjusted values
  const adjustedNutrients: NutrientMap = {};
  
  Object.entries(ingredient.nutrients).forEach(([key, nutrient]) => {
    adjustedNutrients[key] = {
      value: nutrient.value * ratio,
      unit: nutrient.unit
    };
  });
  
  return {
    calories: ingredient.calories * ratio,
    protein: ingredient.protein * ratio,
    carbs: ingredient.carbs * ratio,
    fat: ingredient.fat * ratio,
    fiber: ingredient.fiber * ratio,
    nutrients: adjustedNutrients
  };
};

// Calculate total nutrition for an entire dish
export const calculateDishNutrition = (
  dish: Dish,
  ingredientsMap: Record<string, Ingredient>
): NutritionSummary => {
  // Initialize summary with zeros
  const summary: NutritionSummary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    nutrients: {}
  };
  
  // Sum nutrition from each ingredient
  dish.ingredients.forEach(({ ingredientId, quantity }) => {
    const ingredient = ingredientsMap[ingredientId];
    
    if (!ingredient) return;
    
    const nutrition = calculateIngredientNutrition(ingredient, quantity);
    summary.calories += nutrition.calories;
    summary.protein += nutrition.protein;
    summary.carbs += nutrition.carbs;
    summary.fat += nutrition.fat;
    summary.fiber += nutrition.fiber;
    
    // Merge nutrients
    Object.entries(nutrition.nutrients).forEach(([key, nutrient]) => {
      if (!summary.nutrients[key]) {
        summary.nutrients[key] = { ...nutrient };
      } else {
        summary.nutrients[key].value += nutrient.value;
      }
    });
  });
  
  return summary;
};

// Calculate macronutrient percentages for pie chart
export const calculateMacroPercentages = (
  nutrition: NutritionSummary
): { label: string; value: number; color: string }[] => {
  const proteinCalories = nutrition.protein * 4;
  const carbCalories = nutrition.carbs * 4;
  const fatCalories = nutrition.fat * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;
  
  // Prevent division by zero
  if (totalCalories === 0) {
    return [
      { label: 'Protein', value: 0, color: '#ef4444' },
      { label: 'Carbs', value: 0, color: '#22c55e' },
      { label: 'Fat', value: 0, color: '#eab308' }
    ];
  }
  
  return [
    {
      label: 'Protein',
      value: Math.round((proteinCalories / totalCalories) * 100),
      color: '#ef4444'
    },
    {
      label: 'Carbs',
      value: Math.round((carbCalories / totalCalories) * 100),
      color: '#22c55e'
    },
    {
      label: 'Fat',
      value: Math.round((fatCalories / totalCalories) * 100),
      color: '#eab308'
    }
  ];
};
