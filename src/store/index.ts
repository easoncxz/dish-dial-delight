
import { configureStore } from '@reduxjs/toolkit';
import { ingredientsReducer } from './ingredientsSlice';
import { dishesReducer } from './dishesSlice';
import { uiReducer } from './uiSlice';
import { formReducer } from './formSlice';
import { toastReducer } from './toastSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    dishes: dishesReducer,
    ui: uiReducer,
    form: formReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
