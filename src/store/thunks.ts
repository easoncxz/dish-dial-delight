
import { AppDispatch, RootState } from './index';
import { setIngredients, setIngredientsLoading } from './ingredientsSlice';
import { setDishes, setDishesLoading } from './dishesSlice';
import { getStoredIngredients, getStoredDishes } from '@/utils/indexedDB';
import { Ingredient, Dish } from '@/types';

// Thunk to load data from IndexedDB
export const loadData = () => async (dispatch: AppDispatch) => {
  try {
    // Load ingredients
    dispatch(setIngredientsLoading(true));
    const ingredients = await getStoredIngredients();
    dispatch(setIngredients(ingredients));
    dispatch(setIngredientsLoading(false));
    
    // Load dishes
    dispatch(setDishesLoading(true));
    const dishes = await getStoredDishes();
    dispatch(setDishes(dishes));
    dispatch(setDishesLoading(false));
  } catch (error) {
    console.error('Error loading data:', error);
    dispatch(setIngredientsLoading(false));
    dispatch(setDishesLoading(false));
  }
};

// Function to check if an ingredient can be deleted
export const canDeleteIngredient = (state: RootState, ingredientId: string) => {
  return !state.dishes.items.some(dish => 
    dish.ingredients.some(ingredient => ingredient.ingredientId === ingredientId)
  );
};

// Function to export data - returning a string directly
export const exportAppData = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const data = {
    ingredients: state.ingredients.items,
    dishes: state.dishes.items
  };
  return JSON.stringify(data);
};

// Function to import data
export const importAppData = (jsonData: string) => async (dispatch: AppDispatch) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data.ingredients || !Array.isArray(data.ingredients) || 
        !data.dishes || !Array.isArray(data.dishes)) {
      throw new Error('Invalid data format');
    }
    
    // Import ingredients
    dispatch(setIngredients(data.ingredients as Ingredient[]));
    
    // Import dishes
    dispatch(setDishes(data.dishes as Dish[]));
    
    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};
