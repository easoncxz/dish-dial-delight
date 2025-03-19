
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
export const toast = (() => {
  // This creates a closure that we'll use to store the latest dispatch function
  let currentDispatch: any = null;
  let currentGetToasts: (() => ToastType[]) | null = null;
  
  // This function can be called to set the dispatch function from the outside
  const setDispatch = (dispatch: any, getToasts: () => ToastType[]) => {
    currentDispatch = dispatch;
    currentGetToasts = getToasts;
  };
  
  // This is the actual toast function
  const toastFn = (options: ToastOptions) => {
    if (!currentDispatch) {
      console.error('Toast was called before Redux was initialized');
      return { id: '', update: () => {}, dismiss: () => {} };
    }
    
    const action = addToast(options);
    currentDispatch(action);
    
    const id = action.payload?.id;
    
    // Auto-dismiss after duration
    if (id) {
      const duration = options.duration || DEFAULT_TOAST_DURATION;
      setTimeout(() => {
        currentDispatch(dismissToast(id));
      }, duration);
    
      return {
        id,
        update: (props: Partial<ToastOptions>) => 
          currentDispatch(updateToast({ ...props, id })),
        dismiss: () => currentDispatch(dismissToast(id)),
      };
    }
    
    return { id: '', update: () => {}, dismiss: () => {} };
  };
  
  // Add the setDispatch method to the toast function
  toastFn.setDispatch = setDispatch;
  
  return toastFn;
})();
