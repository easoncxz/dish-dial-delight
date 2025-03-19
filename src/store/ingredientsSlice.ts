
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Ingredient } from '@/types';
import { getStoredIngredients, storeIngredients } from '@/utils/indexedDB';
import { RootState } from './index';
import { toast } from '@/components/ui/use-toast';

interface IngredientsState {
  items: Ingredient[];
  isLoading: boolean;
}

const initialState: IngredientsState = {
  items: [],
  isLoading: true,
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.items = action.payload;
    },
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      const newIngredient = {
        ...action.payload,
        id: action.payload.id || uuidv4()
      };
      state.items.push(newIngredient);
      
      // Save to IndexedDB
      storeIngredients(state.items).catch(error => {
        console.error('Error saving ingredients:', error);
        toast({
          variant: "destructive",
          title: "Error saving ingredient",
          description: "There was a problem saving your ingredient data."
        });
      });
      
      toast({
        title: "Ingredient added",
        description: `${newIngredient.name} has been added to your ingredients.`
      });
    },
    updateIngredient: (state, action: PayloadAction<Ingredient>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        
        // Save to IndexedDB
        storeIngredients(state.items).catch(error => {
          console.error('Error saving ingredients:', error);
          toast({
            variant: "destructive",
            title: "Error updating ingredient",
            description: "There was a problem saving your ingredient data."
          });
        });
        
        toast({
          title: "Ingredient updated",
          description: `${action.payload.name} has been updated.`
        });
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      const deletedIngredient = state.items.find(item => item.id === action.payload);
      state.items = state.items.filter(item => item.id !== action.payload);
      
      // Save to IndexedDB
      storeIngredients(state.items).catch(error => {
        console.error('Error saving ingredients:', error);
        toast({
          variant: "destructive",
          title: "Error deleting ingredient",
          description: "There was a problem saving your ingredient data."
        });
      });
      
      if (deletedIngredient) {
        toast({
          title: "Ingredient deleted",
          description: `${deletedIngredient.name} has been removed.`
        });
      }
    },
    setIngredientsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setIngredients, 
  addIngredient, 
  updateIngredient, 
  deleteIngredient,
  setIngredientsLoading,
} = ingredientsSlice.actions;

// Selectors
export const selectIngredients = (state: RootState) => state.ingredients.items;
export const selectIngredientsLoading = (state: RootState) => state.ingredients.isLoading;

export const ingredientsReducer = ingredientsSlice.reducer;
