import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, Trash2, Calculator } from "lucide-react";
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
import { Meal, Dish, MealDish, NutritionSummary } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";

interface MealFormProps {
  existingMeal: Meal | null;
  onComplete: () => void;
}

const MealForm = ({ existingMeal, onComplete }: MealFormProps) => {
  const { dishes, addMeal, updateMeal, calculateDishNutrition, calculateMealNutrition, calculateMealNutritionPerServing } = useData();
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [nutritionPerServing, setNutritionPerServing] = useState<NutritionSummary | null>(null);
  
  const [name, setName] = useState(existingMeal?.name || "");
  const [description, setDescription] = useState(existingMeal?.description || "");
  const [servings, setServings] = useState(existingMeal?.servings || 4);
  const [mealDishes, setMealDishes] = useState<MealDish[]>(
    existingMeal?.dishes || []
  );
  
  // Add state to track temporary scaling factor values during input
  const [tempScalingFactors, setTempScalingFactors] = useState<Record<number, string>>({});
  
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Meal Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Badge className="ml-2 whitespace-nowrap">
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
            className="resize-none min-h-[100px]"
          />
        </div>
      </div>

      {/* Dish Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Dishes</h3>
          <Button type="button" onClick={handleAddDish} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Dish
          </Button>
        </div>

        {mealDishes.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">No dishes added yet. Add your first dish to this meal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mealDishes.map((mealDish, index) => {
              // Get the dish to display its details
              const dish = dishes.find(d => d.id === mealDish.dishId);
              const dishNutrition = dish ? calculateDishNutrition(dish) : null;
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Select Dish</Label>
                          <Select
                            value={mealDish.dishId}
                            onValueChange={(value) => handleChangeDish(index, value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a dish" />
                            </SelectTrigger>
                            <SelectContent>
                              {dishes.map((dish) => (
                                <SelectItem key={dish.id} value={dish.id}>
                                  {dish.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() => handleRemoveDish(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {dish && (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <Label className="text-sm mb-1 block">Scaling Factor</Label>
                                <div className="flex gap-2 items-center">
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
                                    className="w-24"
                                  />
                                  <span className="text-sm text-muted-foreground">× {dish.name}</span>
                                </div>
                              </div>
                              <div className="flex flex-col ml-4">
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
                              <p className="text-muted-foreground mb-1">Nutrition (with scaling):</p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
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
        <div className="rounded-md border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center">
              <Calculator className="h-4 w-4 mr-2" /> 
              Nutrition Summary
            </h3>
            <Badge variant="outline">
              {servings} {servings === 1 ? "serving" : "servings"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Total Meal</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-medium">{Math.round(nutritionSummary.calories)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protein</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.protein)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.carbs)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fat</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.fat)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fiber</p>
                  <p className="font-medium">{formatNutritionValue(nutritionSummary.fiber)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Per Serving</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-medium">{Math.round(nutritionPerServing?.calories || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protein</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.protein || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.carbs || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fat</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.fat || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fiber</p>
                  <p className="font-medium">{formatNutritionValue(nutritionPerServing?.fiber || 0)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Macronutrient Distribution */}
          <div className="pt-3 border-t">
            <p className="text-sm mb-2">Macronutrient Distribution (per serving)</p>
            <div className="flex gap-3">
              {calculateMacroPercentages(nutritionPerServing || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, nutrients: {} })
                .filter(macro => macro.value > 0)
                .map((macro, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-1.5" 
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="text-xs">{macro.label} {Math.round(macro.value)}%</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
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