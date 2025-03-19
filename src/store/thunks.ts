
import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setIngredients, 
  setIngredientsLoading,
  selectIngredients
} from './ingredientsSlice';
import { 
  setDishes, 
  setDishesLoading,
  selectDishes
} from './dishesSlice';
import {
  setExportedData,
  setDialogOpen
} from './uiSlice';
import { 
  getStoredIngredients, 
  getStoredDishes,
  exportAllData,
  importAllData
} from '@/utils/indexedDB';
import { RootState } from './index';
import { toast } from '@/components/ui/use-toast';
import { Dish, Ingredient } from '@/types';
import { calculateDishNutrition } from '@/utils/calculations';

// Load data from IndexedDB
export const loadData = createAsyncThunk(
  'data/load',
  async (_, { dispatch }) => {
    try {
      dispatch(setIngredientsLoading(true));
      dispatch(setDishesLoading(true));
      
      const storedIngredients = await getStoredIngredients();
      const storedDishes = await getStoredDishes();
      
      dispatch(setIngredients(storedIngredients));
      dispatch(setDishes(storedDishes));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "There was a problem loading your data."
      });
    } finally {
      dispatch(setIngredientsLoading(false));
      dispatch(setDishesLoading(false));
    }
  }
);

// Export data
export const exportDataThunk = createAsyncThunk(
  'data/export',
  async (_, { dispatch }) => {
    try {
      const jsonData = await exportAllData();
      dispatch(setExportedData(jsonData));
      dispatch(setDialogOpen({key: 'exportDialog', value: true}));
      return jsonData;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data."
      });
      return "";
    }
  }
);

// Import data
export const importDataThunk = createAsyncThunk(
  'data/import',
  async (jsonData: string, { dispatch }) => {
    try {
      const { ingredients, dishes } = await importAllData(jsonData);
      dispatch(setIngredients(ingredients));
      dispatch(setDishes(dishes));
      dispatch(setDialogOpen({key: 'importDialog', value: false}));
      toast({
        title: "Import successful",
        description: `Imported ${ingredients.length} ingredients and ${dishes.length} dishes.`
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error importing your data. Please check the file format."
      });
    }
  }
);

// Check if an ingredient can be deleted (not used in any dish)
export const canDeleteIngredient = (state: RootState, ingredientId: string): boolean => {
  const dishes = selectDishes(state);
  return !dishes.some(dish => 
    dish.ingredients.some(ingredient => ingredient.ingredientId === ingredientId)
  );
};

// Calculate nutrition for a dish
export const getNutritionForDish = (state: RootState, dish: Dish) => {
  const ingredientsMap: Record<string, Ingredient> = {};
  const allIngredients = selectIngredients(state);
  
  allIngredients.forEach(ingredient => {
    ingredientsMap[ingredient.id] = ingredient;
  });
  
  return calculateDishNutrition(dish, ingredientsMap);
};
