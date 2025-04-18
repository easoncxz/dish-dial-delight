
import React from "react";
import Header from "@/components/Header";
import DishList from "@/components/DishList";
import ImportExport from "@/components/ImportExport";

const Dishes = () => {
  return (
    <div className="min-h-screen pb-16">
      <Header 
        title="Dishes" 
        description="Create and manage your favorite dishes" 
      />
      <main className="container max-w-6xl">
        <div className="flex justify-end mb-6">
          <ImportExport />
        </div>
        <DishList />
      </main>
    </div>
  );
};

export default Dishes;
