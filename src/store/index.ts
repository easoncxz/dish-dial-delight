
import { configureStore } from '@reduxjs/toolkit';
import { ingredientsReducer } from './ingredientsSlice';
import { dishesReducer } from './dishesSlice';
import { uiReducer } from './uiSlice';
import { formReducer } from './formSlice';
import { toastReducer, selectToasts } from './toastSlice';
import { toast as toastFunction } from '@/hooks/use-toast';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    dishes: dishesReducer,
    ui: uiReducer,
    form: formReducer,
    toast: toastReducer,
  },
});

// Initialize the toast function with the store's dispatch
// This has to be done after store creation to avoid circular dependencies
(toastFunction as any).setDispatch(
  store.dispatch, 
  () => selectToasts(store.getState())
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
