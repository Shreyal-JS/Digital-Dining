import React from "react";
import { PublicDishItem } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { X, Sparkles, AlertCircle, Utensils } from "lucide-react";

interface DishModalProps {
  dish: PublicDishItem | null;
  currency: string;
  onClose: () => void;
  onLaunchAr: (dish: PublicDishItem) => void;
}

export const DishModal: React.FC<DishModalProps> = ({ dish, currency, onClose, onLaunchAr }) => {
  if (!dish) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-10 p-2 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Image View */}
        <div className="relative w-full h-64 bg-stone-100 flex-shrink-0">
          {dish.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
              <Utensils className="w-12 h-12 mb-2" />
              <p className="text-xs">Photo unavailable</p>
            </div>
          )}

          {dish.arEnabled && (
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onLaunchAr(dish)}
                className="shadow-lg gap-1.5 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                View in 3D / AR
              </Button>
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-5 space-y-4 flex-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-stone-900">{formatCurrency(dish.price, currency)}</span>
              <Badge variant={dish.dietaryType === "VEGETARIAN" || dish.dietaryType === "VEGAN" ? "success" : "neutral"}>
                {dish.dietaryType.toLowerCase()}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">{dish.name}</h2>
            {dish.portion && <p className="text-xs font-medium text-stone-500 mt-0.5">Portion: {dish.portion}</p>}
          </div>

          {dish.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Description</h4>
              <p className="text-sm text-stone-700 mt-1 leading-relaxed">{dish.description}</p>
            </div>
          )}

          {dish.ingredients && (
            <div className="pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Ingredients</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{dish.ingredients}</p>
            </div>
          )}

          {dish.allergens && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Allergen Notice:</strong> {dish.allergens}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
