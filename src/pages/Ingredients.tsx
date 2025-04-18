
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import IngredientList from "@/components/IngredientList";
import ImportExport from "@/components/ImportExport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Ingredients = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Ingredients" 
        description="Manage your ingredient nutritional details" 
      />
      <main className="container max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => navigate("/ingredients/new")}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Ingredient
          </Button>
          <ImportExport />
        </div>
        <IngredientList />
      </main>
    </div>
  );
};

export default Ingredients;
