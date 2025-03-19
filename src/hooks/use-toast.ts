
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToast, 
  updateToast, 
  dismissToast, 
  removeToast, 
  selectToasts,
  Toast as ToastType
} from '@/store/toastSlice';
import { useEffect } from 'react';

// Set a default timeout of 5 seconds for toasts to auto-dismiss
const DEFAULT_TOAST_DURATION = 5000;

type ToastOptions = Omit<ToastType, 'id' | 'open'>;

export function useToast() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);

  // Set up automatic removal of dismissed toasts
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast) => {
      if (!toast.open) {
        const timeout = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, 300); // Delay removal to allow for animation
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [toasts, dispatch]);

  return {
    toasts,
    toast: (options: ToastOptions) => {
      const duration = options.duration || DEFAULT_TOAST_DURATION;
      const id = dispatch(addToast({ ...options }));
      
      // Auto-dismiss after duration
      setTimeout(() => {
        dispatch(dismissToast(id.payload?.id));
      }, duration);

      return {
        id: id.payload?.id,
        update: (props: Partial<ToastOptions>) => 
          id.payload?.id && dispatch(updateToast({ ...props, id: id.payload.id })),
        dismiss: () => id.payload?.id && dispatch(dismissToast(id.payload.id)),
      };
    },
    dismiss: (toastId?: string) => dispatch(dismissToast(toastId)),
  };
}

// Export a standalone toast function for easier access
export const toast = (options: ToastOptions) => {
  store.dispatch(addToast(options));
  
  const id = store.getState().toast.toasts[store.getState().toast.toasts.length - 1]?.id;
  
  // Auto-dismiss after duration
  if (id) {
    const duration = options.duration || DEFAULT_TOAST_DURATION;
    setTimeout(() => {
      store.dispatch(dismissToast(id));
    }, duration);
  
    return {
      id,
      update: (props: Partial<ToastOptions>) => 
        store.dispatch(updateToast({ ...props, id })),
      dismiss: () => store.dispatch(dismissToast(id)),
    };
  }
  
  return { id: '', update: () => {}, dismiss: () => {} };
};

// Need to import store here
import { store } from '@/store';
