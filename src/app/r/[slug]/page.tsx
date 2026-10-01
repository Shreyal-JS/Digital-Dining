"use client";

import React, { useState, useEffect } from "react";
import { PublicMenuResponse, PublicDishItem } from "@/types";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { CategoryNav } from "@/components/customer/CategoryNav";
import { DishCard } from "@/components/customer/DishCard";
import { DishModal } from "@/components/customer/DishModal";
import { ArViewerModal } from "@/components/customer/ArViewerModal";
import { FeedbackModal } from "@/components/customer/FeedbackModal";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CustomerMenuPage({ params }: PageProps) {
  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<PublicDishItem | null>(null);
  const [arTargetDish, setArTargetDish] = useState<PublicDishItem | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu/${params.slug}?lang=${selectedLanguage}`);
        const json = await res.json();
        if (json.success) {
          setMenuData(json.data);
          if (json.data.categories.length > 0) {
            setActiveCategoryId((prev) => (prev ? prev : json.data.categories[0].id));
          }

          // Track menu_view analytics event (Spec Section 15)
          fetch("/api/analytics/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: json.data.restaurant.id,
              eventType: "menu_view",
              sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
              languageCode: selectedLanguage,
            }),
          }).catch(() => {});
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load menu", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [params.slug, selectedLanguage]);

  if (loading && !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-stone-500">Opening Menu...</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 text-center max-w-md mx-auto">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Menu Unavailable</h2>
          <p className="text-xs text-stone-500 mt-1">Please verify the QR code or link and try again.</p>
        </div>
      </div>
    );
  }

  const activeCategory =
    menuData.categories.find((c) => c.id === activeCategoryId) || menuData.categories[0];

  return (
    <CustomerLayout
      restaurantName={menuData.restaurant.name}
      logoUrl={menuData.restaurant.logoUrl}
      currency={menuData.restaurant.currency}
      selectedLanguage={selectedLanguage}
      supportedLanguages={menuData.restaurant.supportedLanguages}
      onLanguageChange={(lang) => setSelectedLanguage(lang)}
      onOpenFeedback={() => setIsFeedbackOpen(true)}
    >
      {/* Category Horizontal Navigation */}
      <CategoryNav
        categories={menuData.categories.map((c) => ({ id: c.id, name: c.name }))}
        activeCategoryId={activeCategory?.id || ""}
        onSelectCategory={(id) => setActiveCategoryId(id)}
      />

      {/* Category Header */}
      {activeCategory && (
        <div className="mt-4 mb-3">
          <h2 className="text-base font-bold text-stone-900">{activeCategory.name}</h2>
          {activeCategory.description && (
            <p className="text-xs text-stone-500 mt-0.5">{activeCategory.description}</p>
          )}
        </div>
      )}

      {/* Dishes List */}
      <div className="space-y-3 mt-3">
        {activeCategory?.dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            currency={menuData.restaurant.currency}
            onClick={() => setSelectedDish(dish)}
          />
        ))}

        {(!activeCategory || activeCategory.dishes.length === 0) && (
          <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-400 text-xs">
            No dishes currently available in this category.
          </div>
        )}
      </div>

      {/* Dish Detail Modal */}
      <DishModal
        dish={selectedDish}
        currency={menuData.restaurant.currency}
        onClose={() => setSelectedDish(null)}
        onLaunchAr={(dish) => {
          setSelectedDish(null);
          setArTargetDish(dish);
        }}
      />

      {/* 3D / AR Viewer Modal */}
      <ArViewerModal
        dish={arTargetDish}
        isOpen={!!arTargetDish}
        onClose={() => setArTargetDish(null)}
      />

      {/* Customer Feedback Modal */}
      <FeedbackModal
        restaurantId={menuData.restaurant.id}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </CustomerLayout>
  );
}
