
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
