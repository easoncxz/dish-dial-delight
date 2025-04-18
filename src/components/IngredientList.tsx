
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash2, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";
import { Ingredient } from "@/types";
import IngredientForm from "./IngredientForm";

const IngredientList = () => {
  const { ingredients, deleteIngredient } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
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
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
        
        <AnimatePresence>
          {filteredIngredients.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredIngredients.map((ingredient) => (
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
                        <Salad className="h-5 w-5 mr-2 text-primary" />
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
                            {Object.keys(ingredient.nutrients).length > 0 ? (
                              <div className="space-y-1.5">
                                {Object.entries(ingredient.nutrients).map(([key, nutrient]) => (
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
              className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg"
            >
              <Salad className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No ingredients found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {ingredients.length === 0
                  ? "You haven't added any ingredients yet."
                  : "No ingredients match your search."}
              </p>
              {ingredients.length === 0 && (
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
