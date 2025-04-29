import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash2, Salad, Grid, List, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { Ingredient, NutritionSummary } from "@/types";
import IngredientForm from "./IngredientForm";
import { calculateMacroPercentages } from "@/utils/calculations";
import MacroNutrientPieChart from "./MacroNutrientPieChart";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";


import MacroDistributionBorder from "./MacroDistributionBorder";

const IngredientList = () => {
  const { ingredients, deleteIngredient } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [view, setView] = useState<"card" | "table">("card");
  const [sortColumn, setSortColumn] = useState<"name" | "calories" | "protein" | "carbs" | "fat" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ingredients, searchQuery]);
  
  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingIngredient(null);
    setIsDialogOpen(true);
  };
  
  const handleSort = (column: "name" | "calories" | "protein" | "carbs" | "fat") => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column clicked, set as active with default direction
      setSortColumn(column);
      setSortDirection("desc");
    }
  };
  
  const sortedIngredients = useMemo(() => {
    const ingredientsList = [...filteredIngredients];
    
    if (!sortColumn) return ingredientsList;
    
    return ingredientsList.sort((a, b) => {
      if (sortColumn === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      const nutritionA: NutritionSummary = {
        calories: a.calories,
        protein: a.protein,
        carbs: a.carbs,
        fat: a.fat,
        fiber: a.fiber,
        nutrients: a.nutrients || {}
      };
      
      const nutritionB: NutritionSummary = {
        calories: b.calories,
        protein: b.protein,
        carbs: b.carbs,
        fat: b.fat,
        fiber: b.fiber,
        nutrients: b.nutrients || {}
      };
      
      // For calories, compare the raw values
      if (sortColumn === "calories") {
        const comparison = nutritionA.calories - nutritionB.calories;
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      // For macros, compare the calculated macro percentages
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
  }, [filteredIngredients, sortColumn, sortDirection]);
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
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
              Add Ingredient
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {filteredIngredients.length > 0 ? (
            <>
              {view === "card" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {sortedIngredients.map((ingredient) => (
                    <motion.div
                      key={ingredient.id}
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
                              <MacroNutrientPieChart ingredient={ingredient} />
                            </div>
                            {ingredient.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <Tabs defaultValue="macros">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="macros">Macros</TabsTrigger>
                              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                            </TabsList>
                            <TabsContent value="macros" className="pt-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Calories</p>
                                  <p className="font-medium">{ingredient.calories}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Protein</p>
                                  <p className="font-medium">{ingredient.protein}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Carbs</p>
                                  <p className="font-medium">{ingredient.carbs}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Fat</p>
                                  <p className="font-medium">{ingredient.fat}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Fiber</p>
                                  <p className="font-medium">{ingredient.fiber}g</p>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="nutrition" className="pt-4">
                              <div className="max-h-24 overflow-y-auto">
                                {Object.keys(ingredient.nutrients || {}).length > 0 ? (
                                  <div className="space-y-1.5">
                                    {Object.entries(ingredient.nutrients || {}).map(([key, nutrient]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-sm">{key}</span>
                                        <span className="text-sm font-medium">
                                          {nutrient.value}{nutrient.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No micronutrient data available</p>
                                )}
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
                              onClick={() => handleEdit(ingredient)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              onClick={() => deleteIngredient(ingredient.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
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
                              Ingredient
                              {sortColumn === "name" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort("calories")}
                          >
                            <div className="flex items-center justify-end">
                              Calories
                              {sortColumn === "calories" && (
                                sortDirection === "asc" ? 
                                <ChevronUp className="ml-1 h-4 w-4" /> : 
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
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
                        {sortedIngredients.map((ingredient) => (
                          <TableRow key={ingredient.id} className="relative">
                            <MacroDistributionBorder ingredient={ingredient} />
                            <TableCell className="font-medium flex items-center pt-6">
                              <div className="h-5 w-5 mr-2 flex items-center justify-center">
                                <MacroNutrientPieChart ingredient={ingredient} />
                              </div>
                              {ingredient.name}
                            </TableCell>
                            <TableCell className="text-right font-medium pt-6">
                              {Math.round(ingredient.calories)}
                            </TableCell>
                            <TableCell className="text-right pt-6">
                              {Math.round(ingredient.protein * 10) / 10}
                            </TableCell>
                            <TableCell className="text-right pt-6">
                              {Math.round(ingredient.carbs * 10) / 10}
                            </TableCell>
                            <TableCell className="text-right pt-6">
                              {Math.round(ingredient.fat * 10) / 10}
                            </TableCell>
                            <TableCell className="text-right pt-6">
                              {Math.round(ingredient.fiber * 10) / 10}
                            </TableCell>
                            <TableCell className="pt-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(ingredient)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteIngredient(ingredient.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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
              <Salad className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No ingredients found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {ingredients.length === 0
                  ? "You haven't added any ingredients yet."
                  : "No ingredients match your search."}
              </p>
              {ingredients.length === 0 && searchQuery === "" && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Ingredient
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </DialogTitle>
          </DialogHeader>
          <IngredientForm 
            existingIngredient={editingIngredient} 
            onComplete={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IngredientList;
