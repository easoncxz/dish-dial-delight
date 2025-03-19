
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Dish } from "@/types";
import DishForm from "./DishForm";
import { selectDishes, selectDishNutrition } from "@/store/dishesSlice";
import { deleteDish } from "@/store/thunks";
import { selectIngredients } from "@/store/ingredientsSlice";
import { 
  selectDialogOpen, 
  selectSearchQuery, 
  selectEditingDish,
  setDialogOpen, 
  setSearchQuery, 
  setEditingDish 
} from "@/store/uiSlice";

const DishList = () => {
  const dispatch = useAppDispatch();
  const dishes = useAppSelector(selectDishes);
  const ingredients = useAppSelector(selectIngredients);
  const dialogOpen = useAppSelector(selectDialogOpen);
  const searchQuery = useAppSelector(selectSearchQuery);
  
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dishes, searchQuery]);
  
  const handleEdit = (dish: Dish) => {
    dispatch(setEditingDish(dish));
    dispatch(setDialogOpen({ key: 'dishForm', value: true }));
  };
  
  const handleAddNew = () => {
    dispatch(setEditingDish(null));
    dispatch(setDialogOpen({ key: 'dishForm', value: true }));
  };
  
  const handleCloseDialog = () => {
    dispatch(setDialogOpen({ key: 'dishForm', value: false }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };
  
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : "Unknown Ingredient";
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Dish
          </Button>
        </div>
        
        <AnimatePresence>
          {filteredDishes.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDishes.map((dish) => {
                const nutrition = useAppSelector(state => selectDishNutrition(state, dish));
                
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
                          <Utensils className="h-5 w-5 mr-2 text-primary" />
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
                              <p className="text-xs text-muted-foreground">Carbs</p>
                              <p className="font-medium">{Math.round(nutrition.carbs * 10) / 10}g</p>
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
                            onClick={() => dispatch(deleteDish(dish.id))}
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
              className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg"
            >
              <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No dishes found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {dishes.length === 0
                  ? "You haven't created any dishes yet."
                  : "No dishes match your search."}
              </p>
              {dishes.length === 0 && (
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Dish
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Dialog open={dialogOpen.dishForm} onOpenChange={(open) => dispatch(setDialogOpen({ key: 'dishForm', value: open }))}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {useAppSelector(selectEditingDish) ? "Edit Dish" : "Create New Dish"}
            </DialogTitle>
          </DialogHeader>
          <DishForm onComplete={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DishList;
