import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import MealForm from "@/components/MealForm";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types";

interface EditMealProps {
  isCreating: boolean;
}

const EditMeal = ({ isCreating }: EditMealProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meals } = useData();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setError(""); // Clear previous errors
    
    // For new meals, just set to null and we're done
    if (isCreating) {
      setMeal(null);
      setLoading(false);
      return;
    }

    // For editing, try to find the meal with the matching ID
    if (id) {
      const foundMeal = meals.find(m => m.id === id);
      if (foundMeal) {
        setMeal(foundMeal);
      } else {
        setError("Meal not found");
      }
    } else {
      setError("No meal ID provided");
    }
    setLoading(false);
  }, [id, meals, isCreating]);

  // Handle completion of the form
  const handleComplete = () => {
    navigate("/meals");
  };

  return (
    <main className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/meals")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Meals
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">
            {isCreating ? "Add New Meal" : "Edit Meal"}
          </h1>
          <div className="bg-card p-2 sm:p-4 rounded-lg shadow-sm">
            <MealForm existingMeal={meal} onComplete={handleComplete} />
          </div>
        </>
      )}
    </main>
  );
};

export default EditMeal;