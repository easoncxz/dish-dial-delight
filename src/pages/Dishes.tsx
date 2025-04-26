import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import DishList from "@/components/DishList";

const Dishes = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Dishes" 
        description="Create and manage your favorite dishes" 
      />
      <main className="max-w-6xl mx-auto">
        <DishList />
      </main>
    </div>
  );
};

export default Dishes;
