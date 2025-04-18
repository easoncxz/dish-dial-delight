
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useData } from "@/context/DataContext";
import DishForm from "@/components/DishForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const EditDish = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dishes, calculateDishNutrition } = useData();
  
  const dish = id ? dishes.find(d => d.id === id) : undefined;
  const isNewDish = !id || !dish;
  
  // Calculate macronutrient calorie distribution for the chart
  const getMacroCaloriesData = () => {
    if (!dish) return [];
    
    const nutrition = calculateDishNutrition(dish);
    const proteinCalories = nutrition.protein * 4;
    const carbsCalories = nutrition.carbs * 4;
    const fatCalories = nutrition.fat * 9;
    
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
        title={isNewDish ? "Add Dish" : "Edit Dish"} 
        description={isNewDish 
          ? "Create a new dish by combining ingredients" 
          : `Edit ${dish?.name}`} 
      />
      
      <main className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/dishes')}
          >
            <ArrowLeft size={16} />
            Back to Dishes
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DishForm 
              existingDish={dish} 
              onComplete={() => navigate('/dishes')} 
            />
          </div>
          
          {!isNewDish && dish && (
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
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} kcal`, 'Calories']} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-sm text-muted-foreground mt-4">
                <p>This chart shows the distribution of calories from different macronutrients in this dish.</p>
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

export default EditDish;
