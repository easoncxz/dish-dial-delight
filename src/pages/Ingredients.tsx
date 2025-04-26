import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import IngredientList from "@/components/IngredientList";

const Ingredients = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Ingredients" 
        description="Manage your ingredient nutritional details" 
      />
      <main className="container max-w-6xl">
        <IngredientList />
      </main>
    </div>
  );
};

export default Ingredients;
