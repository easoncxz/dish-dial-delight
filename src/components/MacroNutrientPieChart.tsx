import { useRef, useEffect } from "react";
import { NutritionSummary, Ingredient } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";

interface MacroNutrientPieChartProps {
  nutrition?: NutritionSummary;
  ingredient?: Ingredient;
  size?: number; // Size in pixels, defaults to 20px
}

const MacroNutrientPieChart = ({ nutrition, ingredient, size = 20 }: MacroNutrientPieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Convert ingredient to nutrition summary if provided
  const nutritionData: NutritionSummary | undefined = nutrition || (ingredient ? {
    calories: ingredient.calories,
    protein: ingredient.protein,
    carbs: ingredient.carbs,
    fat: ingredient.fat,
    fiber: ingredient.fiber,
    nutrients: ingredient.nutrients || {}
  } : undefined);
  
  // If no nutrition data is available, return empty chart
  if (!nutritionData) {
    return (
      <div className={`relative w-[${size}px] h-[${size}px] rounded-full bg-muted`}>
        <div className="absolute inset-0 rounded-full border border-muted-foreground/10" />
      </div>
    );
  }
  
  const macros = calculateMacroPercentages(nutritionData);
  
  // Render the pie chart using divs
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    
    // Clear previous chart
    chart.innerHTML = "";
    
    let cumulativeAngle = 0;
    const center = size / 2;
    const radius = size / 2;
    
    macros.forEach((macro) => {
      if (macro.value <= 0) return;
      
      const segment = document.createElement("div");
      segment.className = "absolute inset-0";
      
      // Calculate segment styles
      const startAngle = cumulativeAngle;
      const angleSize = (macro.value / 100) * 360;
      cumulativeAngle += angleSize;
      
      // Set the clip path for the segment
      segment.style.backgroundColor = macro.color;
      segment.style.clipPath = `path('M ${center} ${center} L ${center + radius * Math.cos((startAngle * Math.PI) / 180)} ${
        center + radius * Math.sin((startAngle * Math.PI) / 180)
      } A ${radius} ${radius} 0 ${angleSize > 180 ? 1 : 0} 1 ${center + radius * Math.cos(((startAngle + angleSize) * Math.PI) / 180)} ${
        center + radius * Math.sin(((startAngle + angleSize) * Math.PI) / 180)
      } Z')`;
      
      chart.appendChild(segment);
    });
  }, [macros, size]);

  return (
    <div className={`relative w-[${size}px] h-[${size}px] rounded-full`} style={{ width: `${size}px`, height: `${size}px` }}>
      <div ref={chartRef} className="absolute inset-0 rounded-full overflow-hidden" />
      <div className="absolute inset-0 rounded-full border border-muted-foreground/10" />
    </div>
  );
};

export default MacroNutrientPieChart;