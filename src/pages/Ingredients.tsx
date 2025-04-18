
import React from "react";
import Header from "@/components/Header";
import IngredientList from "@/components/IngredientList";
import ImportExport from "@/components/ImportExport";

const Ingredients = () => {
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Ingredients" 
        description="Manage your ingredient nutritional details" 
      />
      <main className="container max-w-6xl">
        <div className="flex justify-end mb-6">
          <ImportExport />
        </div>
        <IngredientList />
      </main>
    </div>
  );
};

export default Ingredients;
