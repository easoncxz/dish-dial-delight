
import { Dish, Ingredient, NutritionSummary } from "@/types";

export const calculateDishNutrition = (dish: Dish, ingredients: Ingredient[]): NutritionSummary => {
  const nutrition: NutritionSummary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    nutrients: {}
  };

  // Calculate nutrition from each ingredient
  dish.ingredients.forEach(dishIngredient => {
    const ingredient = ingredients.find(i => i.id === dishIngredient.ingredientId);
    if (!ingredient) return;

    const multiplier = dishIngredient.quantity / 100; // Convert from per 100g to actual amount

    // Add macronutrients
    nutrition.calories += ingredient.calories * multiplier;
    nutrition.protein += ingredient.protein * multiplier;
    nutrition.carbs += ingredient.carbs * multiplier;
    nutrition.fat += ingredient.fat * multiplier;
    nutrition.fiber += ingredient.fiber * multiplier;

    // Add micronutrients
    Object.entries(ingredient.nutrients).forEach(([key, nutrient]) => {
      if (!nutrition.nutrients[key]) {
        nutrition.nutrients[key] = {
          value: 0,
          unit: nutrient.unit
        };
      }
      nutrition.nutrients[key].value += nutrient.value * multiplier;
    });
  });

  return nutrition;
};

// Calculate the percentage contribution of each macronutrient to total calories
export const calculateMacroPercentages = (nutrition: NutritionSummary) => {
  const { protein, carbs, fat } = nutrition;
  
  // Calculate calories from each macronutrient
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  // Calculate total calories from macros
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;
  
  // Calculate percentages (default to 0 if total is 0 to avoid division by zero)
  const proteinPercentage = totalMacroCalories > 0 ? Math.round((proteinCalories / totalMacroCalories) * 100) : 0;
  const carbsPercentage = totalMacroCalories > 0 ? Math.round((carbsCalories / totalMacroCalories) * 100) : 0;
  const fatPercentage = totalMacroCalories > 0 ? Math.round((fatCalories / totalMacroCalories) * 100) : 0;
  
  return [
    { label: "Protein", value: proteinPercentage, color: "#4ade80" }, // green
    { label: "Carbs", value: carbsPercentage, color: "#60a5fa" },    // blue
    { label: "Fat", value: fatPercentage, color: "#f97316" }         // orange
  ];
};
