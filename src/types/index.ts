
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
  isLoading: boolean;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addDish: (dish: Dish) => void;
  updateDish: (dish: Dish) => void;
  deleteDish: (id: string) => void;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  calculateDishNutrition: (dish: Dish) => NutritionSummary;
};
