
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useData } from "@/context/DataContext";
import IngredientForm from "@/components/IngredientForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const EditIngredient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ingredients } = useData();
  
  const ingredient = id ? ingredients.find(ing => ing.id === id) : undefined;
  const isNewIngredient = !id || !ingredient;
  
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
      
      <main className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/ingredients')}
          >
            <ArrowLeft size={16} />
            Back to Ingredients
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <IngredientForm 
              existingIngredient={ingredient} 
              onComplete={() => navigate('/ingredients')} 
            />
          </div>
          
          {!isNewIngredient && ingredient && (
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Calories from Macronutrients</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={macroCaloriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {macroCaloriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(1)} kcal`, 'Calories']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-sm text-muted-foreground mt-4">
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
