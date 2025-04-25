import { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, XCircle, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import NutritionDisplay from "./NutritionDisplay";
import { Dish, DishIngredient } from "@/types";

interface DishFormProps {
  existingDish?: Dish | null;
  onComplete: () => void;
}

const DishForm = ({ existingDish, onComplete }: DishFormProps) => {
  const { ingredients, addDish, updateDish, calculateDishNutrition } = useData();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dishIngredients, setDishIngredients] = useState<DishIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [tempQuantities, setTempQuantities] = useState<Record<number, string>>({});
  
  const nutrition = useMemo(() => {
    const dishData: Dish = {
      id: existingDish?.id || "temp",
      name,
      description,
      ingredients: dishIngredients
    };
    return calculateDishNutrition(dishData);
  }, [dishIngredients, calculateDishNutrition, name, description, existingDish?.id]);
  
  useEffect(() => {
    if (existingDish) {
      setName(existingDish.name);
      setDescription(existingDish.description || "");
      setDishIngredients(existingDish.ingredients);
    } else {
      resetForm();
    }
  }, [existingDish]);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setDishIngredients([]);
    setSelectedIngredientId("");
  };
  
  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;
    
    const exists = dishIngredients.some(item => item.ingredientId === selectedIngredientId);
    
    if (!exists) {
      setDishIngredients([
        ...dishIngredients,
        { ingredientId: selectedIngredientId, quantity: 100 }
      ]);
      setSelectedIngredientId("");
    }
  };
  
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...dishIngredients];
    updatedIngredients.splice(index, 1);
    setDishIngredients(updatedIngredients);
  };
  
  const handleQuantityChange = (index: number, value: number[]) => {
    const updatedIngredients = [...dishIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      quantity: value[0]
    };
    setDishIngredients(updatedIngredients);
  };
  
  const handleQuantityInputFocus = (index: number, quantity: number) => {
    setTempQuantities(prev => ({
      ...prev,
      [index]: quantity.toString()
    }));
  };

  const handleQuantityInputBlur = (index: number) => {
    const value = parseInt(tempQuantities[index] || '0');
    if (!isNaN(value) && value >= 0) {
      // Update the actual ingredient quantity in dishIngredients
      const updatedIngredients = [...dishIngredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        quantity: value
      };
      setDishIngredients(updatedIngredients);
    }
    
    // Clear the temporary quantity for this index
    setTempQuantities(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleQuantityInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setTempQuantities(prev => ({
      ...prev,
      [index]: e.target.value
    }));
  };
  
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || dishIngredients.length === 0) {
      return;
    }
    
    const dishData: Dish = {
      id: existingDish?.id || uuidv4(),
      name,
      description,
      ingredients: dishIngredients
    };
    
    if (existingDish) {
      updateDish(dishData);
    } else {
      addDish(dishData);
    }
    
    resetForm();
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Dish Name</Label>
          <Input
            id="name"
            placeholder="e.g., Chicken Stir Fry"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add notes or description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                    .filter(ing => !dishIngredients.some(item => item.ingredientId === ing.id))
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
          {dishIngredients.length > 0 ? (
            <div className="space-y-3">
              {dishIngredients.map((item, index) => (
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
                          value={tempQuantities[index] || item.quantity}
                          onFocus={(e) => {
                            handleQuantityInputFocus(index, item.quantity);
                            e.target.select(); // Select all text when focused
                          }}
                          onBlur={() => handleQuantityInputBlur(index)}
                          onChange={(e) => handleQuantityInputChange(index, e)}
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
      
      {dishIngredients.length > 0 && (
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
          disabled={!name || dishIngredients.length === 0}
        >
          {existingDish ? "Update" : "Create"} Dish
        </Button>
      </div>
    </form>
  );
};

export default DishForm;
