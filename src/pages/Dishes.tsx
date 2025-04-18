
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import DishList from "@/components/DishList";
import ImportExport from "@/components/ImportExport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Dishes = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Dishes" 
        description="Create and manage your favorite dishes" 
      />
      <main className="container max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => navigate("/dishes/new")}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Dish
          </Button>
          <ImportExport />
        </div>
        <DishList />
      </main>
    </div>
  );
};

export default Dishes;
