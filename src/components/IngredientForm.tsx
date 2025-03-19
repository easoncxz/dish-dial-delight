
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, XCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ingredient, NutrientMap } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addIngredient, updateIngredient } from "@/store/ingredientsSlice";
import { RootState } from "@/store";

interface IngredientFormProps {
  onComplete: () => void;
}

const IngredientForm = ({ onComplete }: IngredientFormProps) => {
  const dispatch = useAppDispatch();
  const existingIngredient = useAppSelector((state: RootState) => state.ui.editingIngredient);
  
  // Instead of useState, get form state from Redux store
  const formState = useAppSelector((state: RootState) => state.form?.ingredient || {
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    nutrients: []
  });
  
  // Initialize form when component mounts or existingIngredient changes
  useEffect(() => {
    if (existingIngredient) {
      dispatch({ 
        type: 'form/setIngredientForm', 
        payload: {
          name: existingIngredient.name,
          calories: existingIngredient.calories.toString(),
          protein: existingIngredient.protein.toString(),
          carbs: existingIngredient.carbs.toString(),
          fat: existingIngredient.fat.toString(),
          fiber: existingIngredient.fiber.toString(),
          nutrients: Object.entries(existingIngredient.nutrients).map(([key, nutrient]) => ({
            key,
            value: nutrient.value.toString(),
            unit: nutrient.unit
          }))
        }
      });
    } else {
      dispatch({ 
        type: 'form/setIngredientForm', 
        payload: {
          name: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          nutrients: []
        }
      });
    }
  }, [existingIngredient, dispatch]);
  
  const handleInputChange = (field: string, value: string) => {
    dispatch({
      type: 'form/updateIngredientField',
      payload: { field, value }
    });
  };
  
  const handleAddNutrient = () => {
    dispatch({
      type: 'form/addIngredientNutrient',
      payload: { key: "", value: "", unit: "mg" }
    });
  };
  
  const handleRemoveNutrient = (index: number) => {
    dispatch({
      type: 'form/removeIngredientNutrient',
      payload: index
    });
  };
  
  const handleNutrientChange = (index: number, field: "key" | "value" | "unit", value: string) => {
    dispatch({
      type: 'form/updateIngredientNutrient',
      payload: { index, field, value }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name || !formState.calories) {
      return;
    }
    
    const nutrientsObject: NutrientMap = {};
    formState.nutrients.forEach(({ key, value, unit }) => {
      if (key && value) {
        nutrientsObject[key] = {
          value: parseFloat(value),
          unit
        };
      }
    });
    
    const ingredientData: Ingredient = {
      id: existingIngredient?.id || uuidv4(),
      name: formState.name,
      calories: parseFloat(formState.calories),
      protein: parseFloat(formState.protein || "0"),
      carbs: parseFloat(formState.carbs || "0"),
      fat: parseFloat(formState.fat || "0"),
      fiber: parseFloat(formState.fiber || "0"),
      nutrients: nutrientsObject
    };
    
    if (existingIngredient) {
      dispatch(updateIngredient(ingredientData));
    } else {
      dispatch(addIngredient(ingredientData));
    }
    
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Ingredient Name</Label>
          <Input
            id="name"
            placeholder="e.g., Chicken Breast"
            value={formState.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>
      </div>
      
      <Tabs defaultValue="macros">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="macros">Macronutrients</TabsTrigger>
          <TabsTrigger value="micro">Micronutrients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="macros" className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="flex items-center">
              <div className="flex-1">
                <Label htmlFor="calories">Calories</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    value={formState.calories}
                    onChange={(e) => handleInputChange("calories", e.target.value)}
                    step="0.1"
                    min="0"
                    required
                  />
                  <span className="ml-2 text-sm text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="w-8"></div> {/* Spacer */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                      <Info size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Enter values per 100g of ingredient</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein">Protein</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={formState.protein}
                    onChange={(e) => handleInputChange("protein", e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">g</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="carbs">Carbohydrates</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={formState.carbs}
                    onChange={(e) => handleInputChange("carbs", e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">g</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fat">Fat</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="fat"
                    type="number"
                    placeholder="0"
                    value={formState.fat}
                    onChange={(e) => handleInputChange("fat", e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">g</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fiber">Fiber</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="fiber"
                    type="number"
                    placeholder="0"
                    value={formState.fiber}
                    onChange={(e) => handleInputChange("fiber", e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">g</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="micro" className="py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Micronutrients</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNutrient}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {formState.nutrients.length > 0 ? (
              <div className="space-y-2">
                {formState.nutrients.map((nutrient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Name (e.g. Vitamin C)"
                      value={nutrient.key}
                      onChange={(e) => handleNutrientChange(index, "key", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Value"
                      value={nutrient.value}
                      onChange={(e) => handleNutrientChange(index, "value", e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-[100px]"
                    />
                    <select
                      value={nutrient.unit}
                      onChange={(e) => handleNutrientChange(index, "unit", e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none"
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="µg">µg</option>
                      <option value="IU">IU</option>
                      <option value="%">%</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveNutrient(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded p-6 text-center">
                <p className="text-muted-foreground mb-2">No micronutrients added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddNutrient}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Micronutrient
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">{existingIngredient ? "Update" : "Add"} Ingredient</Button>
      </div>
    </form>
  );
};

export default IngredientForm;
