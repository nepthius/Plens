import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

interface IngredientTooltipProps {
  name: string;
}

interface IngredientInfo {
  name: string;
  description: string;
  risk_level: string;
  common_names?: string[];
  effects?: string[];
}

export default function IngredientTooltip({ name }: IngredientTooltipProps) {
  const [info, setInfo] = useState<IngredientInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIngredientInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ingredients/${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          setInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch ingredient info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredientInfo();
  }, [name]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-blue-600 hover:underline cursor-help">
          {name}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          {loading ? (
            <p>Loading...</p>
          ) : info ? (
            <div>
              <h4 className="font-semibold mb-2">{info.name}</h4>
              {info.common_names && info.common_names.length > 0 && (
                <p className="text-sm mb-2">
                  Also known as: {info.common_names.join(", ")}
                </p>
              )}
              <p className="text-sm mb-2">{info.description}</p>
              {info.effects && info.effects.length > 0 && (
                <div className="text-sm">
                  <strong>Potential effects:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {info.effects.map((effect, idx) => (
                      <li key={idx}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm mt-2">
                Risk Level:{" "}
                <span
                  className={
                    info.risk_level === "high"
                      ? "text-red-600 font-semibold"
                      : info.risk_level === "medium"
                      ? "text-yellow-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {info.risk_level}
                </span>
              </p>
            </div>
          ) : (
            <p>No information available</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 