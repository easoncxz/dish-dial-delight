import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import IngredientForm from "@/components/IngredientForm";
import { Button } from "@/components/ui/button";

const EditIngredient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ingredients } = useData();
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Find the ingredient with the matching ID
    if (id) {
      const foundIngredient = ingredients.find(i => i.id === id);
      if (foundIngredient) {
        setIngredient(foundIngredient);
      } else {
        setError("Ingredient not found");
      }
    } else {
      setError("No ingredient ID provided");
    }
    setLoading(false);
  }, [id, ingredients]);

  // Handle completion of the form
  const handleComplete = () => {
    navigate("/ingredients");
  };

  return (
    <main className="container max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/ingredients")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Ingredients
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Edit Ingredient</h1>
          <div className="bg-card p-2 sm:p-4 rounded-lg shadow-sm">
            <IngredientForm existingIngredient={ingredient} onComplete={handleComplete} />
          </div>
        </>
      )}
    </main>
  );
};

export default EditIngredient;
