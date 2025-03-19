
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import IngredientForm from "@/components/IngredientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIngredients } from "@/store/ingredientsSlice";
import { setEditingIngredient } from "@/store/uiSlice";

const EditIngredient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ingredients = useAppSelector(selectIngredients);
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  
  const ingredient = id ? ingredients.find(ing => ing.id === id) : undefined;
  const isNewIngredient = !id || !ingredient;
  
  // Set the editing ingredient when component mounts
  useEffect(() => {
    dispatch(setEditingIngredient(ingredient || null));
    
    // Clean up when component unmounts
    return () => {
      dispatch(setEditingIngredient(null));
    };
  }, [dispatch, ingredient]);
  
  // Handle form completion
  const handleComplete = () => {
    navigate('/ingredients');
  };
  
  // Calculate macronutrient calorie distribution for the chart
  const getMacroCaloriesData = () => {
    if (!ingredient) return [];
    
    const proteinCalories = ingredient.protein * 4;
    const carbsCalories = ingredient.carbs * 4;
    const fatCalories = ingredient.fat * 9;
    
    return [
      { name: 'Protein', value: proteinCalories, color: '#10B981' },
      { name: 'Carbs', value: carbsCalories, color: '#3B82F6' },
      { name: 'Fat', value: fatCalories, color: '#F97316' }
    ];
  };
  
  const macroCaloriesData = getMacroCaloriesData();
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title={isNewIngredient ? "Add Ingredient" : "Edit Ingredient"} 
        description={isNewIngredient 
          ? "Add a new ingredient with nutritional details" 
          : `Edit nutritional details for ${ingredient?.name}`} 
      />
      
      <main className={isMobile ? "px-3" : "container max-w-4xl"}>
        <div className="mb-4 md:mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/ingredients')}
          >
            <ArrowLeft size={16} />
            <span className="md:inline">Back to Ingredients</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <IngredientForm onComplete={handleComplete} />
          </div>
          
          {!isNewIngredient && ingredient && (
            <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-3 md:mb-4">Calories from Macronutrients</h3>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroCaloriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 70 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macroCaloriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)} kcal`, 'Calories']} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground mt-3 md:mt-4">
                <p>This chart shows the distribution of calories from different macronutrients in this ingredient.</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Protein: 4 calories per gram</li>
                  <li>Carbohydrates: 4 calories per gram</li>
                  <li>Fat: 9 calories per gram</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditIngredient;
