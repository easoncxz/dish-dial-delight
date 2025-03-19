
import { configureStore } from '@reduxjs/toolkit';
import { ingredientsReducer } from './ingredientsSlice';
import { dishesReducer } from './dishesSlice';
import { uiReducer } from './uiSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    dishes: dishesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
