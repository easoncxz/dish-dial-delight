import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import DishForm from "@/components/DishForm";
import { Button } from "@/components/ui/button";

const EditDish = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dishes } = useData();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Find the dish with the matching ID
    if (id) {
      const foundDish = dishes.find(d => d.id === id);
      if (foundDish) {
        setDish(foundDish);
      } else {
        setError("Dish not found");
      }
    } else {
      setError("No dish ID provided");
    }
    setLoading(false);
  }, [id, dishes]);

  // Handle completion of the form
  const handleComplete = () => {
    navigate("/dishes");
  };

  return (
    <main className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dishes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dishes
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Edit Dish</h1>
          <div className="bg-card p-2 sm:p-4 rounded-lg shadow-sm">
            <DishForm existingDish={dish} onComplete={handleComplete} />
          </div>
        </>
      )}
    </main>
  );
};

export default EditDish;
