
// A simple hook to determine if we're on mobile
// Now uses a plain function that checks window width

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Default to desktop during SSR
  if (typeof window === 'undefined') return false;
  
  // Return true if below breakpoint, false otherwise
  return window.innerWidth < MOBILE_BREAKPOINT;
}
