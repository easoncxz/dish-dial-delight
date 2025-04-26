import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useData } from "@/context/DataContext";
import MealForm from "@/components/MealForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditMeal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meals } = useData();
  
  const meal = id ? meals.find(m => m.id === id) : null;
  const isNewMeal = !id || !meal;
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title={isNewMeal ? "Add Meal" : "Edit Meal"} 
        description={isNewMeal 
          ? "Create a new meal by combining dishes" 
          : `Edit ${meal?.name}`} 
      />
      
      <main className="container max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/meals')}
          >
            <ArrowLeft size={16} />
            Back to Meals
          </Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <MealForm 
            existingMeal={meal} 
            onComplete={() => navigate('/meals')} 
          />
        </div>
      </main>
    </div>
  );
};

export default EditMeal;