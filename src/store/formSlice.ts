
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface NutrientFormField {
  key: string;
  value: string;
  unit: string;
}

interface IngredientFormState {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  nutrients: NutrientFormField[];
}

interface DishIngredientFormField {
  ingredientId: string;
  quantity: number;
}

interface DishFormState {
  name: string;
  description: string;
  ingredients: DishIngredientFormField[];
}

interface FormState {
  ingredient: IngredientFormState;
  dish: DishFormState;
}

const initialState: FormState = {
  ingredient: {
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    nutrients: []
  },
  dish: {
    name: '',
    description: '',
    ingredients: []
  }
};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setIngredientForm: (state, action: PayloadAction<IngredientFormState>) => {
      state.ingredient = action.payload;
    },
    updateIngredientField: (state, action: PayloadAction<{field: string, value: string}>) => {
      const { field, value } = action.payload;
      (state.ingredient as any)[field] = value;
    },
    addIngredientNutrient: (state, action: PayloadAction<NutrientFormField>) => {
      state.ingredient.nutrients.push(action.payload);
    },
    removeIngredientNutrient: (state, action: PayloadAction<number>) => {
      state.ingredient.nutrients.splice(action.payload, 1);
    },
    updateIngredientNutrient: (
      state, 
      action: PayloadAction<{index: number, field: keyof NutrientFormField, value: string}>
    ) => {
      const { index, field, value } = action.payload;
      state.ingredient.nutrients[index][field] = value;
    },
    setDishForm: (state, action: PayloadAction<DishFormState>) => {
      state.dish = action.payload;
    },
    updateDishField: (state, action: PayloadAction<{field: string, value: string}>) => {
      const { field, value } = action.payload;
      (state.dish as any)[field] = value;
    },
    setDishIngredients: (state, action: PayloadAction<DishIngredientFormField[]>) => {
      state.dish.ingredients = action.payload;
    },
    addDishIngredient: (state, action: PayloadAction<DishIngredientFormField>) => {
      state.dish.ingredients.push(action.payload);
    },
    removeDishIngredient: (state, action: PayloadAction<number>) => {
      state.dish.ingredients.splice(action.payload, 1);
    },
    updateDishIngredient: (
      state,
      action: PayloadAction<{index: number, quantity: number}>
    ) => {
      const { index, quantity } = action.payload;
      state.dish.ingredients[index].quantity = quantity;
    }
  },
});

export const {
  setIngredientForm,
  updateIngredientField,
  addIngredientNutrient,
  removeIngredientNutrient,
  updateIngredientNutrient,
  setDishForm,
  updateDishField,
  setDishIngredients,
  addDishIngredient,
  removeDishIngredient,
  updateDishIngredient
} = formSlice.actions;

// Selectors
export const selectIngredientForm = (state: RootState) => state.form.ingredient;
export const selectDishForm = (state: RootState) => state.form.dish;

export const formReducer = formSlice.reducer;
