import React from "react";

interface CategoryNavProps {
  categories: { id: string; name: string }[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none -mx-4 px-4 sticky top-14 bg-stone-50/95 backdrop-blur z-20">
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </nav>
  );
};
