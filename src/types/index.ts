export interface Nutrient {
  value: number;
  unit: string;
}

export interface NutrientMap {
  [key: string]: Nutrient;
}

export interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutrients: NutrientMap;
  photoUrl?: string;
}

export interface DishIngredient {
  ingredientId: string;
  quantity: number; // in grams
}

export interface Dish {
  id: string;
  name: string;
  ingredients: DishIngredient[];
  description?: string;
}

export interface MealDish {
  dishId: string;
  scalingFactor: number; // e.g., 0.5 for half portion, 2 for double portion
}

export interface Meal {
  id: string;
  name: string;
  dishes: MealDish[];
  servings: number; // number of people the meal is for
  description?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutrients: NutrientMap;
}

export type DataContextType = {
  ingredients: Ingredient[];
  dishes: Dish[];
  meals: Meal[];
  isLoading: boolean;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addDish: (dish: Dish) => void;
  updateDish: (dish: Dish) => void;
  deleteDish: (id: string) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (meal: Meal) => void;
  deleteMeal: (id: string) => void;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  calculateDishNutrition: (dish: Dish) => NutritionSummary;
  calculateMealNutrition: (meal: Meal) => NutritionSummary;
  calculateMealNutritionPerServing: (meal: Meal) => NutritionSummary;
};
