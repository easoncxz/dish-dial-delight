
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apple, Utensils, ChevronRight, Plus } from "lucide-react";
import NutritionDisplay from "@/components/NutritionDisplay";
import { useData } from "@/context/DataContext";
import Header from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();
  const { dishes, ingredients, calculateDishNutrition } = useData();
  const [selectedDishId, setSelectedDishId] = useState<string>("");
  
  const selectedDish = useMemo(() => {
    return dishes.find(dish => dish.id === selectedDishId) || null;
  }, [selectedDishId, dishes]);
  
  const nutrition = useMemo(() => {
    if (!selectedDish) return null;
    return calculateDishNutrition(selectedDish);
  }, [selectedDish, calculateDishNutrition]);
  
  const hasData = dishes.length > 0 || ingredients.length > 0;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="NutriPlan" 
        description="Calculate nutrition for your meals with precision" 
      />
      
      <main className="container max-w-6xl">
        {hasData ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={item} className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Dish Selector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Select a dish to view nutrition
                      </label>
                      <Select value={selectedDishId} onValueChange={setSelectedDishId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a dish" />
                        </SelectTrigger>
                        <SelectContent>
                          {dishes.length > 0 ? (
                            dishes.map(dish => (
                              <SelectItem key={dish.id} value={dish.id}>
                                {dish.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No dishes available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => navigate("/ingredients")}
                      >
                        <div className="flex items-center">
                          <Apple className="mr-2 h-4 w-4" />
                          Manage Ingredients
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => navigate("/dishes")}
                      >
                        <div className="flex items-center">
                          <Utensils className="mr-2 h-4 w-4" />
                          Manage Dishes
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={item} className="md:col-span-2">
              {selectedDish && nutrition ? (
                <NutritionDisplay nutrition={nutrition} />
              ) : (
                <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Dish Selected</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Select a dish from the dropdown to view its nutritional information
                  </p>
                  <Button onClick={() => navigate("/dishes")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Dish
                  </Button>
                </Card>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Utensils className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-medium mb-3">Welcome to NutriPlan</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start by adding your ingredients and creating dishes to calculate nutritional information.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <Button onClick={() => navigate("/ingredients")} size="lg" className="h-auto py-6 flex-col">
                  <Apple className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Add Ingredients</div>
                    <div className="text-xs text-primary-foreground/80 mt-1">
                      Create your ingredient library
                    </div>
                  </div>
                </Button>
                <Button onClick={() => navigate("/dishes")} variant="outline" size="lg" className="h-auto py-6 flex-col">
                  <Utensils className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Create Dishes</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Build recipes from ingredients
                    </div>
                  </div>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
