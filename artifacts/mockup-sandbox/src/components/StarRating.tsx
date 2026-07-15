import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number | null;
  count?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

export default function StarRating({
  value,
  count,
  interactive = false,
  onRate,
  size = 16,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                star <= display
                  ? "text-[#D4A017] fill-[#D4A017]"
                  : "text-[#D4A017]/30"
              }`}
            />
          </button>
        ))}
      </div>
      {value !== null && value !== undefined && (
        <span className="text-sm text-amber-900/60 ml-1">
          {value.toFixed(1)}{count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  );
}
