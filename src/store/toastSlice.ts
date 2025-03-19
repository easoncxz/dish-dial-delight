
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { RootState } from './index';
import { ToastActionElement } from '@/components/ui/toast';

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
  duration?: number;
  open: boolean;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        // Limit the number of toasts to 1
        if (state.toasts.length >= 1) {
          state.toasts = [];
        }
        state.toasts.push(action.payload);
        return state;
      },
      prepare: (toast: Omit<Toast, 'id' | 'open'>) => {
        const id = nanoid();
        return {
          payload: {
            ...toast,
            id,
            open: true,
          }
        };
      }
    },
    updateToast: (state, action: PayloadAction<Partial<Toast> & { id: string }>) => {
      const { id, ...data } = action.payload;
      const toastIndex = state.toasts.findIndex((toast) => toast.id === id);
      if (toastIndex !== -1) {
        state.toasts[toastIndex] = { ...state.toasts[toastIndex], ...data };
      }
    },
    dismissToast: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        const toastIndex = state.toasts.findIndex((toast) => toast.id === action.payload);
        if (toastIndex !== -1) {
          state.toasts[toastIndex].open = false;
        }
      } else {
        // Dismiss all toasts
        state.toasts.forEach((toast) => {
          toast.open = false;
        });
      }
    },
    removeToast: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
      } else {
        state.toasts = [];
      }
    },
  },
});

export const { addToast, updateToast, dismissToast, removeToast } = toastSlice.actions;

export const selectToasts = (state: RootState) => state.toast.toasts;

export const toastReducer = toastSlice.reducer;
