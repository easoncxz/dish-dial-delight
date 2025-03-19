
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Default to desktop during SSR
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    // We still need useEffect here for window resize events
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    window.addEventListener("resize", handleResize);
    
    // Set initial value
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
