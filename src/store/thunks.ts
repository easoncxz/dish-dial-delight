
import { AppDispatch, RootState } from './index';
import { 
  setIngredients, 
  setIngredientsLoading, 
  addIngredient as addIngredientAction, 
  updateIngredient as updateIngredientAction, 
  deleteIngredient as deleteIngredientAction,
  selectIngredients
} from './ingredientsSlice';
import { 
  setDishes, 
  setDishesLoading,
  addDish as addDishAction,
  updateDish as updateDishAction,
  deleteDish as deleteDishAction,
  selectDishes
} from './dishesSlice';
import { 
  getStoredIngredients, 
  getStoredDishes, 
  storeIngredients, 
  storeDishes 
} from '@/utils/indexedDB';
import { Ingredient, Dish } from '@/types';
import { toast } from '@/components/ui/use-toast';

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

// Ingredient CRUD operations with proper toasts and IndexedDB saving
export const addIngredient = (ingredient: Ingredient) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Add to Redux store
    dispatch(addIngredientAction(ingredient));
    
    // Get updated ingredients list and save to IndexedDB
    const ingredients = selectIngredients(getState());
    await storeIngredients(ingredients);
    
    // Show success toast
    toast({
      title: "Ingredient added",
      description: `${ingredient.name} has been added to your ingredients.`
    });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    toast({
      variant: "destructive",
      title: "Error adding ingredient",
      description: "There was a problem saving your ingredient data."
    });
  }
};

export const updateIngredient = (ingredient: Ingredient) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Update in Redux store
    dispatch(updateIngredientAction(ingredient));
    
    // Get updated ingredients list and save to IndexedDB
    const ingredients = selectIngredients(getState());
    await storeIngredients(ingredients);
    
    // Show success toast
    toast({
      title: "Ingredient updated",
      description: `${ingredient.name} has been updated.`
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    toast({
      variant: "destructive",
      title: "Error updating ingredient",
      description: "There was a problem saving your ingredient data."
    });
  }
};

export const deleteIngredient = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Get the ingredient name before deleting
    const state = getState();
    const ingredient = selectIngredients(state).find(item => item.id === id);
    const name = ingredient?.name || 'Ingredient';
    
    // Delete from Redux store
    dispatch(deleteIngredientAction(id));
    
    // Get updated ingredients list and save to IndexedDB
    const ingredients = selectIngredients(getState());
    await storeIngredients(ingredients);
    
    // Show success toast
    toast({
      title: "Ingredient deleted",
      description: `${name} has been removed.`
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    toast({
      variant: "destructive",
      title: "Error deleting ingredient",
      description: "There was a problem saving your ingredient data."
    });
  }
};

// Dish CRUD operations with proper toasts and IndexedDB saving
export const addDish = (dish: Dish) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Add to Redux store
    dispatch(addDishAction(dish));
    
    // Get updated dishes list and save to IndexedDB
    const dishes = selectDishes(getState());
    await storeDishes(dishes);
    
    // Show success toast
    toast({
      title: "Dish added",
      description: `${dish.name} has been added to your dishes.`
    });
  } catch (error) {
    console.error('Error adding dish:', error);
    toast({
      variant: "destructive",
      title: "Error adding dish",
      description: "There was a problem saving your dish data."
    });
  }
};

export const updateDish = (dish: Dish) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Update in Redux store
    dispatch(updateDishAction(dish));
    
    // Get updated dishes list and save to IndexedDB
    const dishes = selectDishes(getState());
    await storeDishes(dishes);
    
    // Show success toast
    toast({
      title: "Dish updated",
      description: `${dish.name} has been updated.`
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    toast({
      variant: "destructive",
      title: "Error updating dish",
      description: "There was a problem saving your dish data."
    });
  }
};

export const deleteDish = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // Get the dish name before deleting
    const state = getState();
    const dish = selectDishes(state).find(item => item.id === id);
    const name = dish?.name || 'Dish';
    
    // Delete from Redux store
    dispatch(deleteDishAction(id));
    
    // Get updated dishes list and save to IndexedDB
    const dishes = selectDishes(getState());
    await storeDishes(dishes);
    
    // Show success toast
    toast({
      title: "Dish deleted",
      description: `${name} has been removed.`
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    toast({
      variant: "destructive",
      title: "Error deleting dish",
      description: "There was a problem saving your dish data."
    });
  }
};
