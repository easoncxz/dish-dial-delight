
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToast, 
  updateToast, 
  dismissToast, 
  removeToast, 
  selectToasts,
  Toast as ToastType
} from '@/store/toastSlice';
import { useEffect, useRef } from 'react';

// Set a default timeout of 5 seconds for toasts to auto-dismiss
const DEFAULT_TOAST_DURATION = 5000;

type ToastOptions = Omit<ToastType, 'id' | 'open'>;

type ToastTimeout = {
  id: string;
  timeoutId: NodeJS.Timeout;
  type: 'dismiss' | 'remove';
};

export function useToast() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);
  const timeoutsRef = useRef<ToastTimeout[]>([]);

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t.timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  // Set up automatic removal of dismissed toasts
  useEffect(() => {
    // Clear existing 'remove' timeouts
    timeoutsRef.current = timeoutsRef.current.filter((t) => {
      if (t.type === 'remove') {
        clearTimeout(t.timeoutId);
        return false;
      }
      return true;
    });
    
    // Create new timeouts for dismissed toasts
    toasts.forEach((toast) => {
      if (!toast.open) {
        const timeout = setTimeout(() => {
          dispatch(removeToast(toast.id));
          // Remove this timeout from ref after execution
          timeoutsRef.current = timeoutsRef.current.filter(t => !(t.id === toast.id && t.type === 'remove'));
        }, 300); // Delay removal to allow for animation
        
        timeoutsRef.current.push({ 
          id: toast.id, 
          timeoutId: timeout, 
          type: 'remove' 
        });
      }
    });
  }, [toasts, dispatch]);

  // Helper function to clear existing timeouts for a toast
  const clearToastTimeouts = (id: string) => {
    timeoutsRef.current = timeoutsRef.current.filter((t) => {
      if (t.id === id) {
        clearTimeout(t.timeoutId);
        return false;
      }
      return true;
    });
  };

  return {
    toasts,
    toast: (options: ToastOptions) => {
      const action = dispatch(addToast({ ...options }));
      const id = action.payload?.id;
      
      if (id) {
        // Clear any existing timeouts for this toast
        clearToastTimeouts(id);
        
        // Auto-dismiss after duration
        const duration = options.duration || DEFAULT_TOAST_DURATION;
        const timeoutId = setTimeout(() => {
          dispatch(dismissToast(id));
          // Remove this timeout from ref after execution
          timeoutsRef.current = timeoutsRef.current.filter(t => !(t.id === id && t.type === 'dismiss'));
        }, duration);
        
        // Track the timeout
        timeoutsRef.current.push({ 
          id, 
          timeoutId, 
          type: 'dismiss' 
        });

        return {
          id,
          update: (props: Partial<ToastOptions>) => {
            dispatch(updateToast({ ...props, id }));
            
            // If duration is updated, reset the timeout
            if (props.duration) {
              clearToastTimeouts(id);
              const newTimeoutId = setTimeout(() => {
                dispatch(dismissToast(id));
                timeoutsRef.current = timeoutsRef.current.filter(t => !(t.id === id && t.type === 'dismiss'));
              }, props.duration);
              timeoutsRef.current.push({ 
                id, 
                timeoutId: newTimeoutId, 
                type: 'dismiss' 
              });
            }
          },
          dismiss: () => {
            clearToastTimeouts(id);
            dispatch(dismissToast(id));
          },
        };
      }
      
      return { id: '', update: () => {}, dismiss: () => {} };
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        clearToastTimeouts(toastId);
      } else {
        // Clear all dismiss timeouts if dismissing all toasts
        timeoutsRef.current = timeoutsRef.current.filter((t) => {
          if (t.type === 'dismiss') {
            clearTimeout(t.timeoutId);
            return false;
          }
          return true;
        });
      }
      dispatch(dismissToast(toastId));
    },
  };
}

// Export a standalone toast function for easier access
export const toast = (() => {
  // This creates a closure that we'll use to store the latest dispatch function
  let currentDispatch: any = null;
  let currentGetToasts: (() => ToastType[]) | null = null;
  let activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // This function can be called to set the dispatch function from the outside
  const setDispatch = (dispatch: any, getToasts: () => ToastType[]) => {
    currentDispatch = dispatch;
    currentGetToasts = getToasts;
  };
  
  const clearToastTimeout = (id: string) => {
    const timeout = activeTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      activeTimeouts.delete(id);
    }
  };
  
  // This is the actual toast function
  const toastFn = (options: ToastOptions) => {
    if (!currentDispatch) {
      console.error('Toast was called before Redux was initialized');
      return { id: '', update: () => {}, dismiss: () => {} };
    }
    
    const action = addToast(options);
    currentDispatch(action);
    
    // Correctly extract id from the payload structure
    const id = action.payload?.id;
    
    // Auto-dismiss after duration
    if (id) {
      // Clear any existing timeout for this toast
      clearToastTimeout(id);
      
      const duration = options.duration || DEFAULT_TOAST_DURATION;
      const timeoutId = setTimeout(() => {
        currentDispatch(dismissToast(id));
        activeTimeouts.delete(id);
      }, duration);
      
      // Store the timeout reference
      activeTimeouts.set(id, timeoutId);
    
      return {
        id,
        update: (props: Partial<ToastOptions>) => {
          currentDispatch(updateToast({ ...props, id }));
          
          // If duration is updated, reset the timeout
          if (props.duration) {
            clearToastTimeout(id);
            const newTimeoutId = setTimeout(() => {
              currentDispatch(dismissToast(id));
              activeTimeouts.delete(id);
            }, props.duration);
            activeTimeouts.set(id, newTimeoutId);
          }
        },
        dismiss: () => {
          clearToastTimeout(id);
          currentDispatch(dismissToast(id));
        },
      };
    }
    
    return { id: '', update: () => {}, dismiss: () => {} };
  };
  
  // Add the setDispatch method to the toast function
  toastFn.setDispatch = setDispatch;
  
  return toastFn;
})();
