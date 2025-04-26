import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Apple, 
  Utensils, 
  ChevronRight, 
  Menu, 
  X,
  Database,
  Coffee
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const routes = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/ingredients", label: "Ingredients", icon: Apple },
    { path: "/dishes", label: "Dishes", icon: Utensils },
    { path: "/meals", label: "Meals", icon: Coffee },
    { path: "/data", label: "Data Management", icon: Database },
  ];
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed z-30 top-0 left-0 h-screen w-64 border-r border-border bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Utensils size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-semibold tracking-tight">NutriPlan</span>
          </div>
        </div>
        
        <div className="mt-2 px-3">
          {routes.map((route) => {
            const isActive = route.path === location.pathname;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "flex items-center px-3 py-2.5 mb-1.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <route.icon className="mr-3 h-4 w-4" />
                {route.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Mobile header */}
      <nav className="md:hidden fixed z-30 top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-border h-14 flex items-center px-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground rounded-md hover:bg-secondary"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-1.5">
            <Utensils size={18} className="text-primary" />
            <span className="text-lg font-display font-medium">NutriPlan</span>
          </div>
        </div>
        
        <div className="w-9 h-9"></div>
      </nav>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed z-40 inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-card shadow-xl"
          >
            <div className="p-5 flex justify-between items-center border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <Utensils size={18} className="text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold">NutriPlan</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mt-2 px-3">
              {routes.map((route) => {
                const isActive = route.path === location.pathname;
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={cn(
                      "flex items-center px-3 py-3 mb-1 rounded-md text-base font-medium transition-all",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <route.icon className="mr-3 h-5 w-5" />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
