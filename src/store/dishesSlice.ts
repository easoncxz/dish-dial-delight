
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
    },
    updateDish: (state, action: PayloadAction<Dish>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteDish: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
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
