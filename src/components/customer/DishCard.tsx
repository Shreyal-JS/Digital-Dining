import React from "react";
import { PublicDishItem } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/common/Badge";
import { Box, Sparkles } from "lucide-react";

interface DishCardProps {
  dish: PublicDishItem;
  currency: string;
  onClick: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, currency, onClick }) => {
  const dietaryBadgeVariant =
    dish.dietaryType === "VEGETARIAN" || dish.dietaryType === "VEGAN" ? "success" : "neutral";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex cursor-pointer"
    >
      {/* Content Side */}
      <div className="flex-1 p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${
                dish.dietaryType === "VEGETARIAN" || dish.dietaryType === "VEGAN"
                  ? "bg-emerald-600"
                  : "bg-red-600"
              }`}
              title={dish.dietaryType}
            />
            <Badge variant={dietaryBadgeVariant}>{dish.dietaryType.toLowerCase()}</Badge>
            {dish.arEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                <Sparkles className="w-2.5 h-2.5" /> 3D/AR
              </span>
            )}
          </div>

          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-1">{dish.name}</h3>
          {dish.description && (
            <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">{dish.description}</p>
          )}
        </div>

        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-100">
          <span className="font-bold text-stone-900 text-sm">{formatCurrency(dish.price, currency)}</span>
          {dish.portion && <span className="text-[11px] text-stone-400">{dish.portion}</span>}
        </div>
      </div>

      {/* Image Side */}
      <div className="w-28 h-28 relative bg-stone-100 flex-shrink-0 self-center m-2 rounded-lg overflow-hidden">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Box className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
};
