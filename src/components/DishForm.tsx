
import { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import NutritionDisplay from "./NutritionDisplay";
import { Dish, DishIngredient } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIngredients } from "@/store/ingredientsSlice";
import { selectDishNutrition } from "@/store/dishesSlice";
import { addDish, updateDish } from "@/store/thunks";
import { selectEditingDish } from "@/store/uiSlice";
import { 
  selectDishForm, 
  setDishForm, 
  updateDishField, 
  setDishIngredients, 
  updateDishIngredient 
} from "@/store/formSlice";

interface DishFormProps {
  onComplete: () => void;
}

const DishForm = ({ onComplete }: DishFormProps) => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectIngredients);
  const existingDish = useAppSelector(selectEditingDish);
  const formState = useAppSelector(selectDishForm);
  
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  
  // Initialize form state when component mounts or existingDish changes
  useEffect(() => {
    if (existingDish) {
      dispatch(setDishForm({
        name: existingDish.name,
        description: existingDish.description || "",
        ingredients: existingDish.ingredients
      }));
    } else {
      dispatch(setDishForm({
        name: "",
        description: "",
        ingredients: []
      }));
    }
  }, [existingDish, dispatch]);
  
  // Calculate nutrition based on current form state
  const nutrition = useMemo(() => {
    const dishData: Dish = {
      id: existingDish?.id || "temp",
      name: formState.name,
      description: formState.description,
      ingredients: formState.ingredients
    };
    return useAppSelector(state => selectDishNutrition(state, dishData));
  }, [formState, existingDish?.id]);
  
  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;
    
    const exists = formState.ingredients.some(item => item.ingredientId === selectedIngredientId);
    
    if (!exists) {
      const updatedIngredients = [
        ...formState.ingredients,
        { ingredientId: selectedIngredientId, quantity: 100 }
      ];
      dispatch(setDishIngredients(updatedIngredients));
      setSelectedIngredientId("");
    }
  };
  
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...formState.ingredients];
    updatedIngredients.splice(index, 1);
    dispatch(setDishIngredients(updatedIngredients));
  };
  
  const handleQuantityChange = (index: number, value: number[]) => {
    dispatch(updateDishIngredient({
      index,
      quantity: value[0]
    }));
  };
  
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };
  
  const handleInputChange = (field: string, value: string) => {
    dispatch(updateDishField({ field, value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name || formState.ingredients.length === 0) {
      return;
    }
    
    const dishData: Dish = {
      id: existingDish?.id || uuidv4(),
      name: formState.name,
      description: formState.description,
      ingredients: formState.ingredients
    };
    
    if (existingDish) {
      dispatch(updateDish(dishData));
    } else {
      dispatch(addDish(dishData));
    }
    
    // Delay the onComplete call to ensure Redux state updates first
    setTimeout(() => {
      onComplete();
    }, 0);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Dish Name</Label>
          <Input
            id="name"
            placeholder="e.g., Chicken Stir Fry"
            value={formState.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add notes or description..."
            value={formState.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={2}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="ingredient-select">Add Ingredient</Label>
            <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an ingredient" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.length > 0 ? (
                  ingredients
                    .filter(ing => !formState.ingredients.some(item => item.ingredientId === ing.id))
                    .map(ingredient => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="none" disabled>
                    No ingredients available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleAddIngredient}
            disabled={!selectedIngredientId}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        <div>
          {formState.ingredients.length > 0 ? (
            <div className="space-y-3">
              {formState.ingredients.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{getIngredientName(item.ingredientId)}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveIngredient(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                      <div className="w-full">
                        <Slider
                          value={[item.quantity]}
                          min={1}
                          max={500}
                          step={1}
                          onValueChange={(value) => handleQuantityChange(index, value)}
                          className="my-1.5"
                        />
                      </div>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 500) {
                              handleQuantityChange(index, [value]);
                            }
                          }}
                          className="w-[80px]"
                          min={1}
                          max={500}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">g</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded p-6 text-center">
              <p className="text-muted-foreground mb-2">No ingredients added yet</p>
              <p className="text-sm text-muted-foreground mb-3">
                Select ingredients above to add them to your dish
              </p>
            </div>
          )}
        </div>
      </div>
      
      {formState.ingredients.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Nutrition Preview</h3>
          <NutritionDisplay nutrition={nutrition} />
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formState.name || formState.ingredients.length === 0}
        >
          {existingDish ? "Update" : "Create"} Dish
        </Button>
      </div>
    </form>
  );
};

export default DishForm;
