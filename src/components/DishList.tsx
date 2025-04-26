import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash2, Utensils, Grid, List, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/DataContext";
import { Dish, NutritionSummary } from "@/types";
import DishForm from "./DishForm";
import { calculateMacroPercentages } from "@/utils/calculations";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

// Small MacroNutrient Pie Chart Component
const MacroNutrientPieChart = ({ nutrition }: { nutrition: NutritionSummary }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const macros = calculateMacroPercentages(nutrition);
  
  // Render the pie chart using divs
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    
    // Clear previous chart
    chart.innerHTML = "";
    
    let cumulativeAngle = 0;
    
    macros.forEach((macro) => {
      if (macro.value <= 0) return;
      
      const segment = document.createElement("div");
      segment.className = "absolute inset-0";
      
      // Calculate segment styles
      const startAngle = cumulativeAngle;
      const angleSize = (macro.value / 100) * 360;
      cumulativeAngle += angleSize;
      
      // Set the clip path for the segment
      segment.style.backgroundColor = macro.color;
      segment.style.clipPath = `path('M ${10} ${10} L ${10 + 10 * Math.cos((startAngle * Math.PI) / 180)} ${
        10 + 10 * Math.sin((startAngle * Math.PI) / 180)
      } A 10 10 0 ${angleSize > 180 ? 1 : 0} 1 ${10 + 10 * Math.cos(((startAngle + angleSize) * Math.PI) / 180)} ${
        10 + 10 * Math.sin(((startAngle + angleSize) * Math.PI) / 180)
      } Z')`;
      
      chart.appendChild(segment);
    });
  }, [macros]);

  return (
    <div className="relative w-[20px] h-[20px] rounded-full">
      <div ref={chartRef} className="absolute inset-0 rounded-full overflow-hidden" />
      <div className="absolute inset-0 rounded-full border border-muted-foreground/10" />
    </div>
  );
};

// New component for the macro distribution border
const MacroDistributionBorder = ({ nutrition }: { nutrition: NutritionSummary }) => {
  const macros = calculateMacroPercentages(nutrition);
  
  return (
    <div className="absolute top-0 left-0 right-0 h-4 flex">
      {macros.map((macro, index) => (
        macro.value > 0 ? (
          <div 
            key={index} 
            style={{ 
              width: `${macro.value}%`,
              background: `linear-gradient(to bottom, ${macro.color} 0%, transparent 100%)`
            }} 
            className="h-full"
          />
        ) : null
      ))}
    </div>
  );
};

const DishList = () => {
  const { dishes, ingredients, deleteDish, calculateDishNutrition } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [view, setView] = useState<"card" | "table">("card");
  const [sortColumn, setSortColumn] = useState<"name" | "protein" | "carbs" | "fat" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dishes, searchQuery]);
  
  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingDish(null);
    setIsDialogOpen(true);
  };
  
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };
  
  const handleSort = (column: "name" | "protein" | "carbs" | "fat") => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column clicked, set as active with default direction
      setSortColumn(column);
      setSortDirection("desc");
    }
  };
  
  const sortedDishes = useMemo(() => {
    const dishes = [...filteredDishes];
    
    if (!sortColumn) return dishes;
    
    return dishes.sort((dishA, dishB) => {
      if (sortColumn === "name") {
        const comparison = dishA.name.localeCompare(dishB.name);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      const nutritionA = calculateDishNutrition(dishA);
      const nutritionB = calculateDishNutrition(dishB);
      
      // Calculate percentage of calories from macros rather than absolute amounts
      const macrosA = calculateMacroPercentages(nutritionA);
      const macrosB = calculateMacroPercentages(nutritionB);
      
      // Find the percentage value for the selected macro
      const getMacroValue = (macros: {label: string; value: number; color: string}[], macroName: string) => {
        const macro = macros.find(m => m.label.toLowerCase() === macroName);
        return macro ? macro.value : 0;
      };
      
      let comparison = 0;
      switch (sortColumn) {
        case "protein":
          comparison = getMacroValue(macrosA, "protein") - getMacroValue(macrosB, "protein");
          break;
        case "carbs":
          comparison = getMacroValue(macrosA, "carbs") - getMacroValue(macrosB, "carbs");
          break;
        case "fat":
          comparison = getMacroValue(macrosA, "fat") - getMacroValue(macrosB, "fat");
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredDishes, sortColumn, sortDirection, calculateDishNutrition]);
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-md p-0.5 flex items-center">
              <Button
                variant={view === "card" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setView("card")}
              >
                <Grid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Dish
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {filteredDishes.length > 0 ? (
            <>
              {view === "card" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {sortedDishes.map((dish) => {
                    const nutrition = calculateDishNutrition(dish);
                    
                    return (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center">
                              <div className="h-5 w-5 mr-2 text-primary flex items-center justify-center">
                                <MacroNutrientPieChart nutrition={nutrition} />
                              </div>
                              {dish.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Ingredients</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {dish.ingredients.length > 0 ? (
                                    dish.ingredients.map((item, index) => (
                                      <Badge key={index} variant="secondary">
                                        {getIngredientName(item.ingredientId)} ({item.quantity}g)
                                      </Badge>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No ingredients</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Calories</p>
                                  <p className="font-medium">{Math.round(nutrition.calories)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Protein</p>
                                  <p className="font-medium">{Math.round(nutrition.protein * 10) / 10}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Fiber</p>
                                  <p className="font-medium">{Math.round(nutrition.fiber * 10) / 10}g</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <div className="flex space-x-2 w-full">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleEdit(dish)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                onClick={() => deleteDish(dish.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center">
                              Dish
                              {sortColumn === "name" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Ingredients</TableHead>
                          <TableHead className="text-right">Calories</TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("protein")}
                          >
                            <div className="flex items-center justify-end">
                              Protein (g)
                              {sortColumn === "protein" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("carbs")}
                          >
                            <div className="flex items-center justify-end">
                              Carbs (g)
                              {sortColumn === "carbs" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("fat")}
                          >
                            <div className="flex items-center justify-end">
                              Fat (g)
                              {sortColumn === "fat" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Fiber (g)</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDishes.map((dish) => {
                          const nutrition = calculateDishNutrition(dish);
                          
                          return (
                            <TableRow key={dish.id} className="relative">
                              <MacroDistributionBorder nutrition={nutrition} />
                              <TableCell className="font-medium flex items-center pt-6">
                                <div className="h-5 w-5 mr-2 flex items-center justify-center">
                                  <MacroNutrientPieChart nutrition={nutrition} />
                                </div>
                                {dish.name}
                              </TableCell>
                              <TableCell className="pt-6">
                                <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                  {dish.ingredients.length > 0 ? (
                                    dish.ingredients.map((item, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {getIngredientName(item.ingredientId)} ({item.quantity}g)
                                      </Badge>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">None</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium pt-6">
                                {Math.round(nutrition.calories)}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutrition.protein * 10) / 10}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutrition.carbs * 10) / 10}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutrition.fat * 10) / 10}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutrition.fiber * 10) / 10}
                              </TableCell>
                              <TableCell className="pt-6">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(dish)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteDish(dish.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg"
            >
              <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No dishes found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {dishes.length === 0
                  ? "You haven't created any dishes yet."
                  : "No dishes match your search."}
              </p>
              {dishes.length === 0 && searchQuery === "" && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Dish
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? "Edit Dish" : "Create New Dish"}
            </DialogTitle>
          </DialogHeader>
          <DishForm 
            existingDish={editingDish} 
            onComplete={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DishList;
