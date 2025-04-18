
import { Ingredient, Dish } from '@/types';

// LocalStorage keys
const INGREDIENTS_KEY = 'meal-planner-ingredients';
const DISHES_KEY = 'meal-planner-dishes';

// Ingredients storage functions
export const getStoredIngredients = (): Ingredient[] => {
  try {
    const data = localStorage.getItem(INGREDIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving ingredients from localStorage:', error);
    return [];
  }
};

export const storeIngredients = (ingredients: Ingredient[]): void => {
  try {
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
  } catch (error) {
    console.error('Error storing ingredients in localStorage:', error);
  }
};

// Dishes storage functions
export const getStoredDishes = (): Dish[] => {
  try {
    const data = localStorage.getItem(DISHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving dishes from localStorage:', error);
    return [];
  }
};

export const storeDishes = (dishes: Dish[]): void => {
  try {
    localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));
  } catch (error) {
    console.error('Error storing dishes in localStorage:', error);
  }
};

// Export all data as JSON
export const exportAllData = (): string => {
  const data = {
    ingredients: getStoredIngredients(),
    dishes: getStoredDishes(),
    version: '1.0.0',
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

// Import data from JSON
export const importAllData = (jsonData: string): { ingredients: Ingredient[], dishes: Dish[] } => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.ingredients || !data.dishes) {
      throw new Error('Invalid data format: missing ingredients or dishes');
    }
    
    storeIngredients(data.ingredients);
    storeDishes(data.dishes);
    
    return {
      ingredients: data.ingredients,
      dishes: data.dishes
    };
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. The format might be invalid.');
  }
};
