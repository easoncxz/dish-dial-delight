
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { NutritionSummary } from "@/types";
import { calculateMacroPercentages } from "@/utils/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NutritionDisplayProps {
  nutrition: NutritionSummary;
  className?: string;
}

const NutritionDisplay = ({ nutrition, className = "" }: NutritionDisplayProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const macros = calculateMacroPercentages(nutrition);
  
  // Format with 1 decimal place if not a whole number
  const formatNumber = (num: number) => {
    return Math.round(num * 10) / 10;
  };
  
  // Render the pie chart using divs
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    
    // Clear previous chart
    chart.innerHTML = "";
    
    let cumulativeAngle = 0;
    
    macros.forEach((macro) => {
      if (macro.value <= 0) return;
      
      const segment = document.createElement("div");
      segment.className = "nutrition-chart-segment absolute inset-0";
      
      // Calculate segment styles
      const startAngle = cumulativeAngle;
      const angleSize = (macro.value / 100) * 360;
      cumulativeAngle += angleSize;
      
      // Set the clip path for the segment
      segment.style.backgroundColor = macro.color;
      segment.style.clipPath = `path('M ${100} ${100} L ${100 + 80 * Math.cos((startAngle * Math.PI) / 180)} ${
        100 + 80 * Math.sin((startAngle * Math.PI) / 180)
      } A 80 80 0 ${angleSize > 180 ? 1 : 0} 1 ${100 + 80 * Math.cos(((startAngle + angleSize) * Math.PI) / 180)} ${
        100 + 80 * Math.sin(((startAngle + angleSize) * Math.PI) / 180)
      } Z')`;
      
      chart.appendChild(segment);
    });
  }, [macros]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nutrition Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3 flex flex-col">
                  <span className="text-xs text-muted-foreground">Calories</span>
                  <span className="text-xl font-semibold">{Math.round(nutrition.calories)}</span>
                </div>
                <div className="rounded-lg bg-secondary p-3 flex flex-col">
                  <span className="text-xs text-muted-foreground">Fiber</span>
                  <span className="text-xl font-semibold">{formatNumber(nutrition.fiber)}g</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary p-3 flex flex-col">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground mb-1.5">Macronutrients</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Protein</span>
                      <p className="font-medium">{formatNumber(nutrition.protein)}g</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Carbs</span>
                      <p className="font-medium">{formatNumber(nutrition.carbs)}g</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Fat</span>
                      <p className="font-medium">{formatNumber(nutrition.fat)}g</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-secondary p-3">
                  <span className="text-xs text-muted-foreground mb-1.5 block">Micronutrients</span>
                  <div className="max-h-32 overflow-y-auto pr-2">
                    {Object.entries(nutrition.nutrients).length > 0 ? (
                      <div className="space-y-1.5">
                        {Object.entries(nutrition.nutrients).map(([key, nutrient]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm">{key}</span>
                            <span className="text-sm font-medium">
                              {formatNumber(nutrient.value)}{nutrient.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No micronutrient data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-[200px] h-[200px]" ref={chartRef}>
                {/* Chart segments will be injected here */}
                <div className="absolute inset-0 rounded-full bg-background flex items-center justify-center">
                  <div className="w-[120px] h-[120px] rounded-full bg-card flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground">Calories</span>
                    <span className="text-lg font-semibold">{Math.round(nutrition.calories)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2 w-full">
                {macros.map((macro) => (
                  <div key={macro.label} className="flex flex-col items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></div>
                      <span className="text-sm font-medium">{macro.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{macro.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NutritionDisplay;
