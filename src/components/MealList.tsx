import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Utensils, 
  Grid, 
  List, 
  ChevronDown, 
  ChevronUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { Meal, NutritionSummary } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";

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

// Component for the macro distribution border
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

const MealList = () => {
  const { meals, dishes, deleteMeal, calculateMealNutrition, calculateMealNutritionPerServing } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [sortColumn, setSortColumn] = useState<"name" | "servings" | "protein" | "carbs" | "fat" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();
  
  const filteredMeals = useMemo(() => {
    return meals.filter(meal => 
      meal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [meals, searchQuery]);
  
  const handleEdit = (meal: Meal) => {
    navigate(`/meals/edit/${meal.id}`);
  };
  
  const handleAddNew = () => {
    navigate('/meals/new');
  };
  
  const getDishName = (id: string) => {
    const dish = dishes.find(d => d.id === id);
    return dish ? dish.name : "Unknown Dish";
  };
  
  const handleSort = (column: "name" | "servings" | "protein" | "carbs" | "fat") => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column clicked, set as active with default direction
      setSortColumn(column);
      setSortDirection("desc");
    }
  };
  
  const sortedMeals = useMemo(() => {
    const mealsList = [...filteredMeals];
    
    if (!sortColumn) return mealsList;
    
    return mealsList.sort((mealA, mealB) => {
      if (sortColumn === "name") {
        const comparison = mealA.name.localeCompare(mealB.name);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (sortColumn === "servings") {
        const comparison = mealA.servings - mealB.servings;
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      const nutritionA = calculateMealNutritionPerServing(mealA);
      const nutritionB = calculateMealNutritionPerServing(mealB);
      
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
  }, [filteredMeals, sortColumn, sortDirection, calculateMealNutritionPerServing, dishes]);
  
  // Format nutrition values to be user-friendly
  const formatNutritionValue = (value: number): string => {
    return Math.round(value * 10) / 10 + "g";
  };

  const handleEditDish = (dishId: string) => {
    navigate(`/dishes/edit/${dishId}`);
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meals..."
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
              Add Meal
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {filteredMeals.length > 0 ? (
            <>
              {view === "card" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {sortedMeals.map((meal) => {
                    const nutritionPerServing = calculateMealNutritionPerServing(meal);
                    
                    return (
                      <motion.div
                        key={meal.id}
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
                                <MacroNutrientPieChart nutrition={nutritionPerServing} />
                              </div>
                              {meal.name}
                              <Badge variant="outline" className="ml-auto">
                                <Users className="h-3 w-3 mr-1" /> 
                                {meal.servings}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <Tabs defaultValue="dishes">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="dishes">Dishes</TabsTrigger>
                                <TabsTrigger value="nutrition">Nutrition/Serving</TabsTrigger>
                              </TabsList>
                              <TabsContent value="dishes" className="pt-4">
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                  {meal.dishes.length > 0 ? (
                                    meal.dishes.map((mealDish, index) => (
                                      <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm cursor-pointer" onClick={() => handleEditDish(mealDish.dishId)}>{getDishName(mealDish.dishId)}</span>
                                        <span className="text-sm font-medium">
                                          {mealDish.scalingFactor}x
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No dishes in this meal</p>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="nutrition" className="pt-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Calories</p>
                                    <p className="font-medium">{Math.round(nutritionPerServing.calories)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Protein</p>
                                    <p className="font-medium">{formatNutritionValue(nutritionPerServing.protein)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Carbs</p>
                                    <p className="font-medium">{formatNutritionValue(nutritionPerServing.carbs)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Fat</p>
                                    <p className="font-medium">{formatNutritionValue(nutritionPerServing.fat)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Fiber</p>
                                    <p className="font-medium">{formatNutritionValue(nutritionPerServing.fiber)}</p>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                          <CardFooter className="pt-2">
                            <div className="flex space-x-2 w-full">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleEdit(meal)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                onClick={() => deleteMeal(meal.id)}
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
                              Meal
                              {sortColumn === "name" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("servings")}
                          >
                            <div className="flex items-center">
                              Servings
                              {sortColumn === "servings" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Dishes</TableHead>
                          <TableHead className="text-right">Calories/Serving</TableHead>
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
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMeals.map((meal) => {
                          const nutritionPerServing = calculateMealNutritionPerServing(meal);
                          
                          return (
                            <TableRow key={meal.id} className="relative">
                              <MacroDistributionBorder nutrition={nutritionPerServing} />
                              <TableCell className="font-medium flex items-center pt-6">
                                <div className="h-5 w-5 mr-2 flex items-center justify-center">
                                  <MacroNutrientPieChart nutrition={nutritionPerServing} />
                                </div>
                                {meal.name}
                              </TableCell>
                              <TableCell className="pt-6">
                                <Badge variant="outline" className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" /> 
                                  {meal.servings}
                                </Badge>
                              </TableCell>
                              <TableCell className="pt-6">
                                <div className="flex flex-col gap-1 max-w-[250px]">
                                  {meal.dishes.slice(0, 3).map((mealDish, index) => (
                                    <div key={index} className="text-xs flex justify-between">
                                      <span className="cursor-pointer" onClick={() => handleEditDish(mealDish.dishId)}>{getDishName(mealDish.dishId)}</span>
                                      <span className="font-medium ml-2">{mealDish.scalingFactor}x</span>
                                    </div>
                                  ))}
                                  {meal.dishes.length > 3 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{meal.dishes.length - 3} more...
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium pt-6">
                                {Math.round(nutritionPerServing.calories)}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutritionPerServing.protein * 10) / 10}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutritionPerServing.carbs * 10) / 10}
                              </TableCell>
                              <TableCell className="text-right pt-6">
                                {Math.round(nutritionPerServing.fat * 10) / 10}
                              </TableCell>
                              <TableCell className="pt-6">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(meal)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteMeal(meal.id)}
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
              <h3 className="text-lg font-medium">No meals found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {meals.length === 0
                  ? "You haven't created any meals yet."
                  : "No meals match your search."}
              </p>
              {meals.length === 0 && searchQuery === "" && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Meal
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MealList;