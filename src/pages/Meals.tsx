import React from "react";
import Header from "@/components/Header";
import MealList from "@/components/MealList";

const Meals = () => {
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Meals" 
        description="Create multi-dish meals with nutritional information per serving" 
      />
      <main className="container max-w-6xl">
        <MealList />
      </main>
    </div>
  );
};

export default Meals;