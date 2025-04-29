import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, Trash2, Calculator, Edit, ExternalLink, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/DataContext";
import { Meal, Dish, MealDish, NutritionSummary, DishIngredient, Ingredient } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";
import MacroNutrientPieChart from "./MacroNutrientPieChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


import MacroDistributionBorder from "./MacroDistributionBorder";

interface MealFormProps {
  existingMeal: Meal | null;
  onComplete: () => void;
}

interface ShoppingListItem {
  ingredientId: string;
  name: string;
  totalQuantity: number;
  dishes: { dishName: string; quantity: number; scalingFactor: number }[];
}

const MealForm = ({ existingMeal, onComplete }: MealFormProps) => {
  const { dishes, ingredients, addMeal, updateMeal, calculateDishNutrition, calculateMealNutrition, calculateMealNutritionPerServing } = useData();
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [nutritionPerServing, setNutritionPerServing] = useState<NutritionSummary | null>(null);
  const navigate = useNavigate();
  
  const [name, setName] = useState(existingMeal?.name || "");
  const [description, setDescription] = useState(existingMeal?.description || "");
  const [servings, setServings] = useState(existingMeal?.servings || 4);
  const [mealDishes, setMealDishes] = useState<MealDish[]>(
    existingMeal?.dishes || []
  );
  
  // Add state to track temporary scaling factor values during input
  const [tempScalingFactors, setTempScalingFactors] = useState<Record<number, string>>({});
  
  // Add state for expanded ingredient details
  const [expandedDishIngredients, setExpandedDishIngredients] = useState<string[]>([]);
  
  // Calculate nutrition whenever meal dishes or servings change
  useEffect(() => {
    if (mealDishes.length > 0) {
      const tempMeal: Meal = {
        id: existingMeal?.id || uuidv4(),
        name,
        dishes: mealDishes,
        servings,
        description
      };
      
      const totalNutrition = calculateMealNutrition(tempMeal);
      setNutritionSummary(totalNutrition);
      
      const perServing = calculateMealNutritionPerServing(tempMeal);
      setNutritionPerServing(perServing);
    } else {
      setNutritionSummary(null);
      setNutritionPerServing(null);
    }
  }, [mealDishes, servings, calculateMealNutrition, calculateMealNutritionPerServing, name, description, existingMeal?.id]);
  
  const handleAddDish = () => {
    if (dishes.length === 0) return;
    
    setMealDishes([
      ...mealDishes,
      {
        dishId: dishes[0].id, // Default to first dish
        scalingFactor: 1 // Default scaling factor
      }
    ]);
  };
  
  const handleChangeDish = (index: number, dishId: string) => {
    const updatedDishes = [...mealDishes];
    updatedDishes[index] = { ...updatedDishes[index], dishId };
    setMealDishes(updatedDishes);
  };
  
  // Input focus handler for scaling factor
  const handleScalingFactorFocus = (index: number, scalingFactor: number) => {
    setTempScalingFactors(prev => ({
      ...prev,
      [index]: scalingFactor.toString()
    }));
  };
  
  // Input blur handler for scaling factor
  const handleScalingFactorBlur = (index: number) => {
    const value = parseFloat(tempScalingFactors[index] || '0');
    if (!isNaN(value) && value >= 0.1) {
      // Update the actual scaling factor in mealDishes
      const updatedDishes = [...mealDishes];
      updatedDishes[index] = {
        ...updatedDishes[index],
        scalingFactor: value
      };
      setMealDishes(updatedDishes);
    }
    
    // Clear the temporary scaling factor for this index
    setTempScalingFactors(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };
  
  // Input change handler for scaling factor
  const handleScalingFactorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setTempScalingFactors(prev => ({
      ...prev,
      [index]: e.target.value
    }));
  };
  
  // Handle key press in scaling factor input fields
  const handleScalingFactorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter key is pressed, prevent form submission and blur the input
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };
  
  const handleChangeScalingFactor = (index: number, value: string) => {
    // Convert string to number and validate
    const scalingFactor = parseFloat(value) || 0;
    
    // Ensure a minimum positive value
    const validScalingFactor = Math.max(0.1, scalingFactor);
    
    const updatedDishes = [...mealDishes];
    updatedDishes[index] = { ...updatedDishes[index], scalingFactor: validScalingFactor };
    setMealDishes(updatedDishes);
  };
  
  const handleRemoveDish = (index: number) => {
    const updatedDishes = mealDishes.filter((_, i) => i !== index);
    setMealDishes(updatedDishes);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === "") {
      alert("Please enter a name for the meal");
      return;
    }
    
    if (mealDishes.length === 0) {
      alert("Please add at least one dish to the meal");
      return;
    }
    
    const mealData: Meal = {
      id: existingMeal?.id || uuidv4(),
      name: name.trim(),
      dishes: mealDishes,
      servings,
      description: description.trim() || undefined
    };
    
    if (existingMeal) {
      updateMeal(mealData);
    } else {
      addMeal(mealData);
    }
    
    onComplete();
  };
  
  const getDishName = (dishId: string): string => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : "Unknown Dish";
  };

  // Format nutrition values to be user-friendly
  const formatNutritionValue = (value: number): string => {
    return Math.round(value * 10) / 10 + "g";
  };
  
  const handleEditDish = (dishId: string) => {
    navigate(`/dishes/edit/${dishId}`);
  };
  
  const toggleIngredientDetails = (dishId: string) => {
    setExpandedDishIngredients(prev => {
      if (prev.includes(dishId)) {
        return prev.filter(id => id !== dishId);
      } else {
        return [...prev, dishId];
      }
    });
  };
  
  // Get ingredients for a dish
  const getDishIngredients = (dishId: string): DishIngredient[] => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.ingredients : [];
  };
  
  // Get ingredient name by id
  const getIngredientName = (ingredientId: string): string => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };
  
  // Generate shopping list
  const shoppingList = useMemo(() => {
    const itemsMap: Record<string, ShoppingListItem> = {};
    
    mealDishes.forEach(mealDish => {
      const dish = dishes.find(d => d.id === mealDish.dishId);
      if (!dish) return;
      
      dish.ingredients.forEach(ingredient => {
        const ingredientId = ingredient.ingredientId;
        const ingredientObj = ingredients.find(i => i.id === ingredientId);
        if (!ingredientObj) return;
        
        // Calculate the scaled quantity
        const scaledQuantity = ingredient.quantity * mealDish.scalingFactor;
        
        if (itemsMap[ingredientId]) {
          // Update existing item
          itemsMap[ingredientId].totalQuantity += scaledQuantity;
          itemsMap[ingredientId].dishes.push({
            dishName: dish.name,
            quantity: ingredient.quantity,
            scalingFactor: mealDish.scalingFactor
          });
        } else {
          // Create new item
          itemsMap[ingredientId] = {
            ingredientId,
            name: ingredientObj.name,
            totalQuantity: scaledQuantity,
            dishes: [
              {
                dishName: dish.name,
                quantity: ingredient.quantity,
                scalingFactor: mealDish.scalingFactor
              }
            ]
          };
        }
      });
    });
    
    // Convert to array and sort by ingredient name
    return Object.values(itemsMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [mealDishes, dishes, ingredients]);

  // Sort dishes alphabetically by name
  const sortedDishes = useMemo(() => {
    return [...dishes].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }, [dishes]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1 sm:px-6">
      {/* Basic Meal Info */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Meal Name</Label>
            <Input
              id="name"
              placeholder="Enter meal name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Number of Servings</Label>
            <div className="flex items-center gap-2">
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                required
              />
              <Badge className="ml-1 whitespace-nowrap">
                {servings} {servings === 1 ? "person" : "people"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe this meal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none min-h-[80px]"
          />
        </div>
      </div>

      {/* Dish Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Dishes</h3>
          <Button type="button" onClick={handleAddDish} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Dish
          </Button>
        </div>

        {mealDishes.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-md">
            <p className="text-muted-foreground text-sm">No dishes added yet. Add your first dish to this meal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mealDishes.map((mealDish, index) => {
              // Get the dish to display its details
              const dish = dishes.find(d => d.id === mealDish.dishId);
              const dishNutrition = dish ? calculateDishNutrition(dish) : null;
              const dishIngredients = dish ? dish.ingredients : [];
              const isExpanded = expandedDishIngredients.includes(mealDish.dishId);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-2 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Select Dish</Label>
                          <Select
                            value={mealDish.dishId}
                            onValueChange={(value) => handleChangeDish(index, value)}
                          >
                            <SelectTrigger className="mt-1">
                              {dish && dishNutrition && (
                                <div className="h-5 w-5 mr-2 flex items-center justify-center">
                                  <MacroNutrientPieChart nutrition={dishNutrition} />
                                </div>
                              )}
                              <SelectValue placeholder="Select a dish" />
                            </SelectTrigger>
                            <SelectContent>
                              {sortedDishes.map((dish) => (
                                <SelectItem key={dish.id} value={dish.id}>
                                  {dish.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mr-1 sm:mr-2"
                            onClick={() => handleEditDish(mealDish.dishId)}
                            title="Edit this dish"
                          >
                            <Edit className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDish(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {dish && (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <Label className="text-xs sm:text-sm mb-1 block">Scaling Factor</Label>
                                <div className="flex gap-1 sm:gap-2 items-center">
                                  <Input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={tempScalingFactors[index] !== undefined ? tempScalingFactors[index] : mealDish.scalingFactor}
                                    onFocus={(e) => {
                                      handleScalingFactorFocus(index, mealDish.scalingFactor);
                                      e.target.select(); // Select all text when focused
                                    }}
                                    onBlur={() => handleScalingFactorBlur(index)}
                                    onChange={(e) => handleScalingFactorChange(index, e)}
                                    onKeyDown={handleScalingFactorKeyPress}
                                    className="w-16 sm:w-24"
                                  />
                                  <span className="text-xs sm:text-sm text-muted-foreground truncate">× {dish.name}</span>
                                </div>
                              </div>
                              <div className="flex flex-col ml-2 sm:ml-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 mb-1"
                                  onClick={() => handleChangeScalingFactor(index, (mealDish.scalingFactor + 1).toString())}
                                >
                                  +1
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleChangeScalingFactor(index, Math.max(0.1, mealDish.scalingFactor - 1).toString())}
                                  disabled={mealDish.scalingFactor <= 1}
                                >
                                  -1
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {dishNutrition && (
                            <div className="text-sm pt-2 border-t">
                              <p className="text-muted-foreground mb-1 text-xs sm:text-sm">Nutrition (with scaling):</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Calories</p>
                                  <p className="font-medium">{Math.round(dishNutrition.calories * mealDish.scalingFactor)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Protein</p>
                                  <p className="font-medium">{formatNutritionValue(dishNutrition.protein * mealDish.scalingFactor)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Carbs</p>
                                  <p className="font-medium">{formatNutritionValue(dishNutrition.carbs * mealDish.scalingFactor)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fat</p>
                                  <p className="font-medium">{formatNutritionValue(dishNutrition.fat * mealDish.scalingFactor)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Ingredient details */}
                          <div className="pt-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-between text-xs"
                              onClick={() => toggleIngredientDetails(mealDish.dishId)}
                            >
                              <span>
                                {dishIngredients.length} {dishIngredients.length === 1 ? 'ingredient' : 'ingredients'}
                              </span>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            
                            {isExpanded && (
                              <div className="pt-2 space-y-1 pl-2 border-t mt-2">
                                {dishIngredients.length > 0 ? (
                                  dishIngredients.map((ingredient, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                      <span>{getIngredientName(ingredient.ingredientId)}</span>
                                      <span className="font-medium">
                                        {Math.round(ingredient.quantity * mealDish.scalingFactor)}g
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground text-xs">No ingredients in this dish</p>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Nutrition Summary */}
      {nutritionSummary && (
        <div className="rounded-md border p-2 sm:p-4 space-y-3 relative">
          <MacroDistributionBorder nutrition={nutritionPerServing || nutritionSummary} />
          <div className="flex justify-between items-center pt-2">
            <h3 className="text-lg font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2" /> 
              Nutrition Summary
            </h3>
            <Badge variant="outline" className="flex items-center">
              {servings} {servings === 1 ? "serving" : "servings"}
              <div className="h-5 w-5 ml-2 flex items-center justify-center">
                <MacroNutrientPieChart nutrition={nutritionPerServing || nutritionSummary} />
              </div>
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Total Meal</h4>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Calories</p>
                  <p className="font-medium">{Math.round(nutritionSummary.calories)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Protein</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.protein)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Carbs</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.carbs)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fat</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.fat)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fiber</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.fiber)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Per Serving</h4>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Calories</p>
                  <p className="font-medium">{Math.round(nutritionPerServing?.calories || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Protein</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.protein || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Carbs</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.carbs || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fat</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.fat || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fiber</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.fiber || 0)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Macronutrient Distribution */}
          <div className="pt-2 border-t">
            <p className="text-xs sm:text-sm mb-2">Macronutrient Distribution (per serving)</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {calculateMacroPercentages(nutritionPerServing || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, nutrients: {} })
                .filter(macro => macro.value > 0)
                .map((macro, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-1.5" 
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="text-[10px] sm:text-xs">{macro.label} {Math.round(macro.value)}%</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
      
      {/* Shopping List */}
      {mealDishes.length > 0 && (
        <div className="rounded-md border p-2 sm:p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" /> 
              Shopping List
            </h3>
          </div>
          
          <div className="space-y-2">
            {shoppingList.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shopping-list">
                  <AccordionTrigger className="text-sm">
                    View Complete Shopping List ({shoppingList.length} items)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left pb-2">Ingredient</th>
                            <th className="text-right pb-2">Quantity</th>
                            <th className="text-right pb-2">Used in</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingList.map((item) => (
                            <tr key={item.ingredientId} className="border-b border-muted">
                              <td className="py-2">{item.name}</td>
                              <td className="text-right py-2">{Math.round(item.totalQuantity)}g</td>
                              <td className="text-right py-2">
                                <div className="flex flex-col items-end">
                                  {item.dishes.map((dish, i) => (
                                    <span key={i} className="text-xs text-muted-foreground">
                                      {dish.dishName} ({dish.quantity}g × {dish.scalingFactor})
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-sm">No ingredients to display</p>
            )}
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                This shopping list includes all ingredients needed for this meal with quantities adjusted for your scaling factors and servings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {existingMeal ? "Update Meal" : "Create Meal"}
        </Button>
      </div>
    </form>
  );
};

export default MealForm;