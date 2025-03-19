
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Ingredient, Dish } from '@/types';

interface UiState {
  isMobileMenuOpen: boolean;
  selectedDishId: string;
  isDialogOpen: {
    ingredientForm: boolean;
    dishForm: boolean;
    exportDialog: boolean;
    importDialog: boolean;
  };
  importText: string;
  exportedData: string;
  searchQuery: string;
  editingIngredient: Ingredient | null;
  editingDish: Dish | null;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  selectedDishId: '',
  isDialogOpen: {
    ingredientForm: false,
    dishForm: false,
    exportDialog: false,
    importDialog: false,
  },
  importText: '',
  exportedData: '',
  searchQuery: '',
  editingIngredient: null,
  editingDish: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
      // Prevent body scrolling when mobile menu is open
      if (typeof document !== 'undefined') {
        document.body.style.overflow = action.payload ? 'hidden' : '';
      }
    },
    setSelectedDishId: (state, action: PayloadAction<string>) => {
      state.selectedDishId = action.payload;
    },
    setDialogOpen: (
      state, 
      action: PayloadAction<{key: keyof UiState['isDialogOpen'], value: boolean}>
    ) => {
      state.isDialogOpen[action.payload.key] = action.payload.value;
    },
    setImportText: (state, action: PayloadAction<string>) => {
      state.importText = action.payload;
    },
    setExportedData: (state, action: PayloadAction<string>) => {
      state.exportedData = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setEditingIngredient: (state, action: PayloadAction<Ingredient | null>) => {
      state.editingIngredient = action.payload;
    },
    setEditingDish: (state, action: PayloadAction<Dish | null>) => {
      state.editingDish = action.payload;
    },
  },
});

export const { 
  setMobileMenuOpen,
  setSelectedDishId,
  setDialogOpen,
  setImportText,
  setExportedData,
  setSearchQuery,
  setEditingIngredient,
  setEditingDish,
} = uiSlice.actions;

// Selectors
export const selectMobileMenuOpen = (state: RootState) => state.ui.isMobileMenuOpen;
export const selectSelectedDishId = (state: RootState) => state.ui.selectedDishId;
export const selectDialogOpen = (state: RootState) => state.ui.isDialogOpen;
export const selectImportText = (state: RootState) => state.ui.importText;
export const selectExportedData = (state: RootState) => state.ui.exportedData;
export const selectSearchQuery = (state: RootState) => state.ui.searchQuery;
export const selectEditingIngredient = (state: RootState) => state.ui.editingIngredient;
export const selectEditingDish = (state: RootState) => state.ui.editingDish;

export const uiReducer = uiSlice.reducer;
