
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Dish, DishIngredient, NutritionSummary } from '@/types';
import { getStoredDishes, storeDishes } from '@/utils/indexedDB';
import { RootState } from './index';
import { toast } from '@/components/ui/use-toast';
import { calculateDishNutrition } from '@/utils/calculations';

interface DishesState {
  items: Dish[];
  isLoading: boolean;
}

const initialState: DishesState = {
  items: [],
  isLoading: true,
};

export const dishesSlice = createSlice({
  name: 'dishes',
  initialState,
  reducers: {
    setDishes: (state, action: PayloadAction<Dish[]>) => {
      state.items = action.payload;
    },
    addDish: (state, action: PayloadAction<Dish>) => {
      const newDish = {
        ...action.payload,
        id: action.payload.id || uuidv4()
      };
      state.items.push(newDish);
      
      // Save to IndexedDB
      storeDishes(state.items).catch(error => {
        console.error('Error saving dishes:', error);
        toast({
          variant: "destructive",
          title: "Error saving dish",
          description: "There was a problem saving your dish data."
        });
      });
      
      toast({
        title: "Dish added",
        description: `${newDish.name} has been added to your dishes.`
      });
    },
    updateDish: (state, action: PayloadAction<Dish>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        
        // Save to IndexedDB
        storeDishes(state.items).catch(error => {
          console.error('Error saving dishes:', error);
          toast({
            variant: "destructive",
            title: "Error updating dish",
            description: "There was a problem saving your dish data."
          });
        });
        
        toast({
          title: "Dish updated",
          description: `${action.payload.name} has been updated.`
        });
      }
    },
    deleteDish: (state, action: PayloadAction<string>) => {
      const deletedDish = state.items.find(item => item.id === action.payload);
      state.items = state.items.filter(item => item.id !== action.payload);
      
      // Save to IndexedDB
      storeDishes(state.items).catch(error => {
        console.error('Error saving dishes:', error);
        toast({
          variant: "destructive",
          title: "Error deleting dish",
          description: "There was a problem saving your dish data."
        });
      });
      
      if (deletedDish) {
        toast({
          title: "Dish deleted",
          description: `${deletedDish.name} has been removed.`
        });
      }
    },
    setDishesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setDishes, 
  addDish, 
  updateDish, 
  deleteDish,
  setDishesLoading,
} = dishesSlice.actions;

// Selectors
export const selectDishes = (state: RootState) => state.dishes.items;
export const selectDishesLoading = (state: RootState) => state.dishes.isLoading;

// Thunks and utility selectors
export const selectDishById = (state: RootState, id: string) => 
  state.dishes.items.find(dish => dish.id === id);

export const selectDishNutrition = (state: RootState, dish: Dish): NutritionSummary => {
  return calculateDishNutrition(dish, state.ingredients.items);
};

export const canDeleteIngredient = (state: RootState, ingredientId: string) => {
  return !state.dishes.items.some(dish => 
    dish.ingredients.some(ingredient => ingredient.ingredientId === ingredientId)
  );
};

export const dishesReducer = dishesSlice.reducer;
