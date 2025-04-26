import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Ingredient, 
  Dish, 
  Meal,
  DataContextType, 
  NutritionSummary 
} from '@/types';
import { 
  getStoredIngredients, 
  storeIngredients, 
  getStoredDishes, 
  storeDishes,
  getStoredMeals,
  storeMeals,
  exportAllData,
  importAllData
} from '@/utils/indexedDB';
import { calculateDishNutrition } from '@/utils/calculations';
import { toast } from '@/components/ui/use-toast';

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from IndexedDB on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedIngredients = await getStoredIngredients();
        const storedDishes = await getStoredDishes();
        const storedMeals = await getStoredMeals();
        
        setIngredients(storedIngredients);
        setDishes(storedDishes);
        setMeals(storedMeals);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading your data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save ingredients to IndexedDB when changed
  useEffect(() => {
    const saveIngredients = async () => {
      if (ingredients.length > 0 && !isLoading) {
        try {
          await storeIngredients(ingredients);
        } catch (error) {
          console.error('Error saving ingredients:', error);
          toast({
            variant: "destructive",
            title: "Error saving ingredients",
            description: "There was a problem saving your ingredient data."
          });
        }
      }
    };
    
    saveIngredients();
  }, [ingredients, isLoading]);
  
  // Save dishes to IndexedDB when changed
  useEffect(() => {
    const saveDishes = async () => {
      if (dishes.length > 0 && !isLoading) {
        try {
          await storeDishes(dishes);
        } catch (error) {
          console.error('Error saving dishes:', error);
          toast({
            variant: "destructive",
            title: "Error saving dishes",
            description: "There was a problem saving your dish data."
          });
        }
      }
    };
    
    saveDishes();
  }, [dishes, isLoading]);

  // Save meals to IndexedDB when changed
  useEffect(() => {
    const saveMeals = async () => {
      if (meals.length > 0 && !isLoading) {
        try {
          await storeMeals(meals);
        } catch (error) {
          console.error('Error saving meals:', error);
          toast({
            variant: "destructive",
            title: "Error saving meals",
            description: "There was a problem saving your meal data."
          });
        }
      }
    };
    
    saveMeals();
  }, [meals, isLoading]);

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
    // Check if dish is used in any meals
    const usedInMeals = meals.filter(meal => 
      meal.dishes.some(dish => dish.dishId === id)
    );
    
    if (usedInMeals.length > 0) {
      toast({
        variant: "destructive",
        title: "Cannot delete dish",
        description: `This dish is used in ${usedInMeals.length} meal(s). Please remove it from these meals first.`
      });
      return;
    }

    const dishToDelete = dishes.find(dish => dish.id === id);
    setDishes(prev => prev.filter(dish => dish.id !== id));
    
    if (dishToDelete) {
      toast({
        title: "Dish deleted",
        description: `${dishToDelete.name} has been removed.`
      });
    }
  };

  // Meal CRUD operations
  const addMeal = (meal: Meal) => {
    const newMeal = {
      ...meal,
      id: meal.id || uuidv4()
    };
    setMeals(prev => [...prev, newMeal]);
    toast({
      title: "Meal added",
      description: `${newMeal.name} has been added to your meals.`
    });
  };
  
  const updateMeal = (updatedMeal: Meal) => {
    setMeals(prev => 
      prev.map(meal => 
        meal.id === updatedMeal.id ? updatedMeal : meal
      )
    );
    toast({
      title: "Meal updated",
      description: `${updatedMeal.name} has been updated.`
    });
  };
  
  const deleteMeal = (id: string) => {
    const mealToDelete = meals.find(meal => meal.id === id);
    setMeals(prev => prev.filter(meal => meal.id !== id));
    
    if (mealToDelete) {
      toast({
        title: "Meal deleted",
        description: `${mealToDelete.name} has been removed.`
      });
    }
  };
  
  // Export and import functions
  const exportData = async () => {
    try {
      const jsonData = await exportAllData();
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
  
  const importData = async (jsonData: string) => {
    try {
      const { ingredients: newIngredients, dishes: newDishes, meals: newMeals } = await importAllData(jsonData);
      setIngredients(newIngredients);
      setDishes(newDishes);
      setMeals(newMeals || []);
      toast({
        title: "Import successful",
        description: `Imported ${newIngredients.length} ingredients, ${newDishes.length} dishes, and ${newMeals?.length || 0} meals.`
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

  // Calculate nutrition for a meal
  const calculateMealNutrition = (meal: Meal): NutritionSummary => {
    // Create a map of dishes for faster lookup
    const dishesMap: Record<string, Dish> = {};
    dishes.forEach(dish => {
      dishesMap[dish.id] = dish;
    });
    
    // Initialize nutrition summary with zeros
    const summary: NutritionSummary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      nutrients: {}
    };

    // For each dish in the meal, calculate nutrition and apply scaling factor
    meal.dishes.forEach(mealDish => {
      const dish = dishesMap[mealDish.dishId];
      if (dish) {
        const dishNutrition = calculateNutrition(dish);
        summary.calories += dishNutrition.calories * mealDish.scalingFactor;
        summary.protein += dishNutrition.protein * mealDish.scalingFactor;
        summary.carbs += dishNutrition.carbs * mealDish.scalingFactor;
        summary.fat += dishNutrition.fat * mealDish.scalingFactor;
        summary.fiber += dishNutrition.fiber * mealDish.scalingFactor;

        // Combine micronutrients
        Object.entries(dishNutrition.nutrients).forEach(([key, nutrient]) => {
          if (!summary.nutrients[key]) {
            summary.nutrients[key] = { 
              value: nutrient.value * mealDish.scalingFactor,
              unit: nutrient.unit
            };
          } else {
            summary.nutrients[key].value += nutrient.value * mealDish.scalingFactor;
          }
        });
      }
    });

    return summary;
  };

  // Calculate nutrition per serving for a meal
  const calculateMealNutritionPerServing = (meal: Meal): NutritionSummary => {
    const totalNutrition = calculateMealNutrition(meal);
    const servings = meal.servings > 0 ? meal.servings : 1;

    // Calculate per-serving values
    const perServingNutrition: NutritionSummary = {
      calories: totalNutrition.calories / servings,
      protein: totalNutrition.protein / servings,
      carbs: totalNutrition.carbs / servings,
      fat: totalNutrition.fat / servings,
      fiber: totalNutrition.fiber / servings,
      nutrients: {}
    };

    // Divide all micronutrients by number of servings
    Object.entries(totalNutrition.nutrients).forEach(([key, nutrient]) => {
      perServingNutrition.nutrients[key] = {
        value: nutrient.value / servings,
        unit: nutrient.unit
      };
    });

    return perServingNutrition;
  };
  
  const contextValue: DataContextType = {
    ingredients,
    dishes,
    meals,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addDish,
    updateDish,
    deleteDish,
    addMeal,
    updateMeal,
    deleteMeal,
    exportData,
    importData,
    calculateDishNutrition: calculateNutrition,
    calculateMealNutrition,
    calculateMealNutritionPerServing,
    isLoading
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
