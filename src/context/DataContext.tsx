
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Ingredient, 
  Dish, 
  DataContextType, 
  NutritionSummary 
} from '@/types';
import { 
  getStoredIngredients, 
  storeIngredients, 
  getStoredDishes, 
  storeDishes,
  exportAllData,
  importAllData
} from '@/utils/storage';
import { calculateDishNutrition } from '@/utils/calculations';
import { toast } from '@/components/ui/use-toast';

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  
  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedIngredients = getStoredIngredients();
    const storedDishes = getStoredDishes();
    
    setIngredients(storedIngredients);
    setDishes(storedDishes);
  }, []);
  
  // Save ingredients to localStorage when changed
  useEffect(() => {
    if (ingredients.length > 0) {
      storeIngredients(ingredients);
    }
  }, [ingredients]);
  
  // Save dishes to localStorage when changed
  useEffect(() => {
    if (dishes.length > 0) {
      storeDishes(dishes);
    }
  }, [dishes]);
  
  // Ingredient CRUD operations
  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient = {
      ...ingredient,
      id: ingredient.id || uuidv4()
    };
    setIngredients(prev => [...prev, newIngredient]);
    toast({
      title: "Ingredient added",
      description: `${newIngredient.name} has been added to your ingredients.`
    });
  };
  
  const updateIngredient = (updatedIngredient: Ingredient) => {
    setIngredients(prev => 
      prev.map(ingredient => 
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );
    toast({
      title: "Ingredient updated",
      description: `${updatedIngredient.name} has been updated.`
    });
  };
  
  const deleteIngredient = (id: string) => {
    // Check if ingredient is used in any dishes
    const usedInDishes = dishes.filter(dish => 
      dish.ingredients.some(ingredient => ingredient.ingredientId === id)
    );
    
    if (usedInDishes.length > 0) {
      toast({
        variant: "destructive",
        title: "Cannot delete ingredient",
        description: `This ingredient is used in ${usedInDishes.length} dish(es). Please remove it from these dishes first.`
      });
      return;
    }
    
    const ingredientToDelete = ingredients.find(ing => ing.id === id);
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
    
    if (ingredientToDelete) {
      toast({
        title: "Ingredient deleted",
        description: `${ingredientToDelete.name} has been removed.`
      });
    }
  };
  
  // Dish CRUD operations
  const addDish = (dish: Dish) => {
    const newDish = {
      ...dish,
      id: dish.id || uuidv4()
    };
    setDishes(prev => [...prev, newDish]);
    toast({
      title: "Dish added",
      description: `${newDish.name} has been added to your dishes.`
    });
  };
  
  const updateDish = (updatedDish: Dish) => {
    setDishes(prev => 
      prev.map(dish => 
        dish.id === updatedDish.id ? updatedDish : dish
      )
    );
    toast({
      title: "Dish updated",
      description: `${updatedDish.name} has been updated.`
    });
  };
  
  const deleteDish = (id: string) => {
    const dishToDelete = dishes.find(dish => dish.id === id);
    setDishes(prev => prev.filter(dish => dish.id !== id));
    
    if (dishToDelete) {
      toast({
        title: "Dish deleted",
        description: `${dishToDelete.name} has been removed.`
      });
    }
  };
  
  // Export and import functions
  const exportData = () => {
    try {
      const jsonData = exportAllData();
      return jsonData;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data."
      });
      return "";
    }
  };
  
  const importData = (jsonData: string) => {
    try {
      const { ingredients: newIngredients, dishes: newDishes } = importAllData(jsonData);
      setIngredients(newIngredients);
      setDishes(newDishes);
      toast({
        title: "Import successful",
        description: `Imported ${newIngredients.length} ingredients and ${newDishes.length} dishes.`
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error importing your data. Please check the file format."
      });
    }
  };
  
  // Calculate nutrition for a dish
  const calculateNutrition = (dish: Dish): NutritionSummary => {
    const ingredientsMap: Record<string, Ingredient> = {};
    ingredients.forEach(ingredient => {
      ingredientsMap[ingredient.id] = ingredient;
    });
    
    return calculateDishNutrition(dish, ingredientsMap);
  };
  
  const contextValue: DataContextType = {
    ingredients,
    dishes,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addDish,
    updateDish,
    deleteDish,
    exportData,
    importData,
    calculateDishNutrition: calculateNutrition
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
