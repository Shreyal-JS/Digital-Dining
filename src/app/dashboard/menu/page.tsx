"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dish, Category } from "@/types";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { DishDrawer } from "@/components/dashboard/DishDrawer";
import { DishPreview3DModal } from "@/components/dashboard/DishPreview3DModal";
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Box,
  Eye,
  Check,
  ChevronRight,
  GripVertical,
  CheckCircle2,
  Zap,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

const RESTAURANT_ID = "rest_01_pilot_bistro";

export default function MenuDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "OUT_OF_STOCK">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Drawer & Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [previewDish3D, setPreviewDish3D] = useState<Dish | null>(null);

  // Inline Price Editing State: { [dishId]: priceString }
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string>("");

  // Context Menu State: dishId currently open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Toast / Live sync notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, dishRes] = await Promise.all([
        fetch(`/api/restaurants/${RESTAURANT_ID}/categories`),
        fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`),
      ]);
      const catJson = await catRes.json();
      const dishJson = await dishRes.json();

      if (catJson.success) setCategories(catJson.data);
      if (dishJson.success) setDishes(dishJson.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load menu dishes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Search by name, description, ingredients
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description?.toLowerCase().includes(query) ?? false;
        const matchesIngredients = dish.ingredients?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDesc && !matchesIngredients) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== "ALL" && dish.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "AVAILABLE" && !dish.isAvailable) return false;
      if (statusFilter === "OUT_OF_STOCK" && dish.isAvailable) return false;

      return true;
    });
  }, [dishes, searchQuery, selectedCategoryFilter, statusFilter]);

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    const groups: { category: Category; dishes: Dish[] }[] = [];
    const categoryMap = new Map<string, Category>();
    categories.forEach((c) => categoryMap.set(c.id, c));

    // For each category, get matching dishes sorted by displayOrder
    categories.forEach((cat) => {
      const items = filteredDishes
        .filter((d) => d.categoryId === cat.id)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      if (items.length > 0 || selectedCategoryFilter === cat.id) {
        groups.push({ category: cat, dishes: items });
      }
    });

    // Uncategorized if any
    const uncategorized = filteredDishes.filter((d) => !categoryMap.has(d.categoryId));
    if (uncategorized.length > 0) {
      groups.push({
        category: {
          id: "uncategorized",
          restaurantId: RESTAURANT_ID,
          name: "Other Items",
          displayOrder: 99,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
        dishes: uncategorized,
      });
    }

    return groups;
  }, [categories, filteredDishes, selectedCategoryFilter]);

  // Instant Availability Toggle Handler
  const handleToggleAvailability = async (dish: Dish) => {
    const updatedStatus = !dish.isAvailable;
    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: updatedStatus } : d))
    );

    try {
      const res = await fetch(`/api/dishes/${dish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(
        `${dish.name} marked as ${updatedStatus ? "In Stock (Available)" : "86'd (Sold Out)"}`
      );
    } catch (err: any) {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: dish.isAvailable } : d))
      );
      alert("Failed to update availability. Please try again.");
    }
  };

  // Quick Price Inline Save
  const handleSaveInlinePrice = async (dishId: string) => {
    const numPrice = parseFloat(inlinePriceValue);
    if (isNaN(numPrice) || numPrice <= 0) {
      setEditingPriceId(null);
      return;
    }

    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, price: numPrice } : d))
    );
    setEditingPriceId(null);

    try {
      const res = await fetch(`/api/dishes/${dishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: numPrice }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`Updated price to $${numPrice.toFixed(2)}`);
    } catch (err: any) {
      fetchData();
      alert("Failed to update price.");
    }
  };

  // Delete Dish Handler
  const handleDeleteDish = async (dish: Dish) => {
    if (!confirm(`Are you sure you want to delete "${dish.name}" from the menu?`)) {
      return;
    }

    // Optimistic remove
    setDishes((prev) => prev.filter((d) => d.id !== dish.id));
    setOpenMenuId(null);

    try {
      const res = await fetch(`/api/dishes/${dish.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(`Deleted ${dish.name}`);
    } catch (err: any) {
      fetchData();
      alert("Failed to delete dish.");
    }
  };

  // Duplicate Dish Handler
  const handleDuplicateDish = async (dish: Dish) => {
    setOpenMenuId(null);
    try {
      const duplicatedPayload = {
        name: `${dish.name} (Copy)`,
        categoryId: dish.categoryId,
        price: dish.price,
        description: dish.description,
        portion: dish.portion,
        ingredients: dish.ingredients,
        allergens: dish.allergens,
        dietaryType: dish.dietaryType,
        imageUrl: dish.imageUrl,
        model3dUrl: dish.model3dUrl,
        arEnabled: dish.arEnabled,
        isAvailable: true,
        displayOrder: (dish.displayOrder || 0) + 1,
      };

      const res = await fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedPayload),
      });
      const json = await res.json();
      if (json.success) {
        setDishes((prev) => [...prev, json.data]);
        showToast(`Duplicated ${dish.name}`);
      }
    } catch (err) {
      alert("Failed to duplicate dish.");
    }
  };

  // Reorder Item within Category
  const handleMoveOrder = async (dish: Dish, direction: "UP" | "DOWN", groupDishes: Dish[]) => {
    const currentIndex = groupDishes.findIndex((d) => d.id === dish.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= groupDishes.length) return;

    const targetDish = groupDishes[targetIndex];
    const newCurrentOrder = targetDish.displayOrder;
    const newTargetOrder = dish.displayOrder;

    // Optimistic update
    setDishes((prev) =>
      prev.map((d) => {
        if (d.id === dish.id) return { ...d, displayOrder: newCurrentOrder };
        if (d.id === targetDish.id) return { ...d, displayOrder: newTargetOrder };
        return d;
      })
    );

    try {
      await Promise.all([
        fetch(`/api/dishes/${dish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: newCurrentOrder }),
        }),
        fetch(`/api/dishes/${targetDish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: newTargetOrder }),
        }),
      ]);
      showToast("Menu display order updated");
    } catch (err) {
      fetchData();
    }
  };

  // Drawer Save (Create / Update)
  const handleSaveDrawerDish = async (
    dishData: Partial<Dish>,
    imageFile?: File | null,
    modelFile?: File | null
  ) => {
    if (editingDish) {
      // Update existing dish
      const res = await fetch(`/api/dishes/${editingDish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      let updated = json.data;

      // Handle Image File Upload if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgRes = await fetch(`/api/dishes/${editingDish.id}/image`, {
          method: "POST",
          body: formData,
        });
        const imgJson = await imgRes.json();
        if (imgJson.success) updated = imgJson.data;
      }

      // Handle 3D Model File Upload if provided
      if (modelFile) {
        const formData = new FormData();
        formData.append("model", modelFile);
        formData.append("arEnabled", String(dishData.arEnabled ?? true));
        const modelRes = await fetch(`/api/dishes/${editingDish.id}/model`, {
          method: "POST",
          body: formData,
        });
        const modelJson = await modelRes.json();
        if (modelJson.success) updated = modelJson.data;
      }

      setDishes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showToast(`Updated ${updated.name}`);
    } else {
      // Create new dish
      const res = await fetch(`/api/restaurants/${RESTAURANT_ID}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      let created = json.data;

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgRes = await fetch(`/api/dishes/${created.id}/image`, {
          method: "POST",
          body: formData,
        });
        const imgJson = await imgRes.json();
        if (imgJson.success) created = imgJson.data;
      }

      // Upload model if provided
      if (modelFile) {
        const formData = new FormData();
        formData.append("model", modelFile);
        formData.append("arEnabled", String(dishData.arEnabled ?? true));
        const modelRes = await fetch(`/api/dishes/${created.id}/model`, {
          method: "POST",
          body: formData,
        });
        const modelJson = await modelRes.json();
        if (modelJson.success) created = modelJson.data;
      }

      setDishes((prev) => [...prev, created]);
      showToast(`Created new dish: ${created.name}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-stone-800 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Page Header & Breadcrumb */}
        <div>
          {/* Breadcrumb Structure */}
          <nav className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">
            <span>WORKSPACE</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
            <span className="text-stone-600">The Olive Grove Bistro</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
            <span className="text-amber-600 font-bold">Menu Dishes</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">Menu Dishes</h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Manage dishes, availability, pricing, and 3D/AR digital assets.
              </p>
            </div>

            {/* Primary Action Button (+ Add New Dish) */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  setEditingDish(null);
                  setIsDrawerOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add New Dish
              </Button>
            </div>
          </div>
        </div>

        {/* Live Kitchen Sync Tip Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <div>
              <strong className="font-semibold text-amber-950">Instant Diner Sync:</strong> Price changes and availability toggles update customer phones immediately without reprinting QR codes.
            </div>
          </div>
          <a
            href="/r/olive-grove"
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 hover:text-amber-900 underline font-medium whitespace-nowrap hidden sm:inline"
          >
            Preview Customer Menu &rarr;
          </a>
        </div>

        {/* 2. Action Bar: Search, Category Chips, Status Filter, View Toggle */}
        <Card className="p-4 bg-white border-stone-200 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by dish name, ingredients, or allergens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter & View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Statuses ({dishes.length})</option>
                  <option value="AVAILABLE">Available (In Stock)</option>
                  <option value="OUT_OF_STOCK">Sold Out (86&apos;d)</option>
                </select>
              </div>

              {/* View Switcher: Table vs Grid */}
              <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("GRID")}
                  title="Card Grid View"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "GRID"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("TABLE")}
                  title="Data Table View"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    viewMode === "TABLE"
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Dropdown Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-stone-100 scrollbar-none">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1 flex-shrink-0">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategoryFilter === "ALL"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Categories ({dishes.length})
            </button>
            {categories.map((cat) => {
              const count = dishes.filter((d) => d.categoryId === cat.id).length;
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-amber-700/60 text-white" : "bg-stone-200 text-stone-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 3. Main Catalog View: Grid or Table */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading catalog dishes...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No dishes found</h3>
            <p className="text-xs text-stone-500">
              No dishes match your active search and filter criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedDishes.map((group) => {
              if (group.dishes.length === 0) return null;

              return (
                <section key={group.category.id} className="space-y-3">
                  {/* Category Section Header with Items Count */}
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-stone-900">{group.category.name}</h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {group.dishes.length} {group.dishes.length === 1 ? "dish" : "dishes"}
                      </span>
                    </div>
                    {group.category.description && (
                      <span className="text-xs text-stone-400 hidden sm:inline">
                        {group.category.description}
                      </span>
                    )}
                  </div>

                  {/* View: Card Grid */}
                  {viewMode === "GRID" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {group.dishes.map((dish, dishIdx) => {
                        const has3D = Boolean(dish.model3dUrl);
                        const isStock = dish.isAvailable;

                        return (
                          <Card
                            key={dish.id}
                            className={`flex flex-col justify-between bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${
                              isStock ? "border-stone-200" : "border-stone-200/80 bg-stone-50/50 opacity-90"
                            }`}
                          >
                            {/* Card Media Header */}
                            <div className="relative h-44 w-full bg-stone-100 overflow-hidden group">
                              {dish.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                    !isStock ? "grayscale-50" : ""
                                  }`}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                                  <Box className="w-10 h-10 mb-1" />
                                  <span className="text-xs font-medium text-stone-400">No Food Photo</span>
                                </div>
                              )}

                              {/* Badges Overlay Top Left: 3D/AR Ready Chip */}
                              <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                                {has3D ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDish3D(dish)}
                                    title="Click to preview 3D model"
                                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100/95 text-purple-700 border border-purple-200 shadow-2xs backdrop-blur-xs flex items-center gap-1 hover:bg-purple-200 transition-colors"
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-600" />
                                    <span>3D Ready</span>
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900/70 text-stone-300 backdrop-blur-xs">
                                    Missing Model
                                  </span>
                                )}

                                {/* Dietary Tag Pill */}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                                  dish.dietaryType === "VEGAN"
                                    ? "bg-emerald-600/90 text-white"
                                    : dish.dietaryType === "VEGETARIAN"
                                    ? "bg-green-600/90 text-white"
                                    : "bg-stone-800/80 text-stone-200"
                                }`}>
                                  {dish.dietaryType === "NON_VEGETARIAN" ? "Non-Veg" : dish.dietaryType}
                                </span>
                              </div>

                              {/* Top Right Reorder Handles */}
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-stone-900/60 backdrop-blur-xs rounded-lg p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  disabled={dishIdx === 0}
                                  onClick={() => handleMoveOrder(dish, "UP", group.dishes)}
                                  title="Move dish up in menu"
                                  className="p-1 hover:bg-stone-800 rounded disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={dishIdx === group.dishes.length - 1}
                                  onClick={() => handleMoveOrder(dish, "DOWN", group.dishes)}
                                  title="Move dish down in menu"
                                  className="p-1 hover:bg-stone-800 rounded disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Sold Out Watermark Badge */}
                              {!isStock && (
                                <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-2xs flex items-center justify-center">
                                  <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-md">
                                    86&apos;d (Sold Out)
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1">
                                      {dish.name}
                                    </h3>
                                    <span className="text-[11px] font-medium text-stone-400">
                                      {group.category.name}
                                    </span>
                                  </div>

                                  {/* Quick Inline Price Editing */}
                                  <div className="text-right">
                                    {editingPriceId === dish.id ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          step="0.1"
                                          autoFocus
                                          value={inlinePriceValue}
                                          onChange={(e) => setInlinePriceValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSaveInlinePrice(dish.id);
                                            if (e.key === "Escape") setEditingPriceId(null);
                                          }}
                                          onBlur={() => handleSaveInlinePrice(dish.id)}
                                          className="w-16 px-1 py-0.5 text-sm font-bold text-stone-900 border border-amber-500 rounded focus:outline-none"
                                        />
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPriceId(dish.id);
                                          setInlinePriceValue(dish.price.toString());
                                        }}
                                        title="Click to inline edit price"
                                        className="text-base font-extrabold text-stone-900 hover:text-amber-600 hover:underline decoration-dashed decoration-1 underline-offset-4 transition-colors"
                                      >
                                        ${dish.price.toFixed(2)}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {dish.description && (
                                  <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                                    {dish.description}
                                  </p>
                                )}

                                {/* Meta: Portion, prep info */}
                                {dish.portion && (
                                  <div className="mt-2 text-[11px] font-medium text-stone-400 flex items-center gap-1.5">
                                    <span>Portion:</span>
                                    <span className="text-stone-600">{dish.portion}</span>
                                  </div>
                                )}
                              </div>

                              {/* Quick Inline Availability Switch */}
                              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    isStock ? "bg-emerald-500 animate-pulse" : "bg-red-400"
                                  }`} />
                                  <span className="text-xs font-semibold text-stone-700">
                                    {isStock ? "In Stock" : "86'd (Sold Out)"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleAvailability(dish)}
                                  title="Toggle instant availability on customer phones"
                                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isStock ? "bg-emerald-500" : "bg-stone-300"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                      isStock ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Card Footer: Metrics & 3-Dot Context Menu */}
                            <div className="px-4 py-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                                  {Math.floor((dish.displayOrder || 1) * 38 + 14)} scans
                                </span>
                                {has3D && (
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                    {Math.floor((dish.displayOrder || 1) * 8 + 4)} AR
                                  </span>
                                )}
                              </div>

                              {/* Actions Menu */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === dish.id ? null : dish.id)}
                                  className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-200/50 transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {openMenuId === dish.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 p-1 z-30 space-y-0.5 text-xs text-stone-700">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setEditingDish(dish);
                                          setIsDrawerOpen(true);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                                        <span>Edit Dish</span>
                                      </button>

                                      {has3D && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            setPreviewDish3D(dish);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 text-purple-700 flex items-center gap-2"
                                        >
                                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                          <span>Preview in 3D / AR</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateDish(dish)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-2"
                                      >
                                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                                        <span>Duplicate Dish</span>
                                      </button>

                                      <div className="my-1 border-t border-stone-100" />

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDish(dish)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        <span>Delete Dish</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    /* View: Data Table View */
                    <Card className="overflow-hidden border-stone-200">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                              <th className="py-3 px-4 w-12 text-center">Order</th>
                              <th className="py-3 px-4">Dish</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4">Base Price</th>
                              <th className="py-3 px-4">3D / AR Status</th>
                              <th className="py-3 px-4">Live Stock</th>
                              <th className="py-3 px-4">Scans / Views</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-800">
                            {group.dishes.map((dish, dishIdx) => {
                              const has3D = Boolean(dish.model3dUrl);
                              const isStock = dish.isAvailable;

                              return (
                                <tr
                                  key={dish.id}
                                  className="hover:bg-stone-50/80 transition-colors group"
                                >
                                  {/* Drag / Order Handle */}
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                      <button
                                        type="button"
                                        disabled={dishIdx === 0}
                                        onClick={() => handleMoveOrder(dish, "UP", group.dishes)}
                                        title="Move up"
                                        className="text-stone-300 hover:text-stone-700 disabled:opacity-20"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={dishIdx === group.dishes.length - 1}
                                        onClick={() => handleMoveOrder(dish, "DOWN", group.dishes)}
                                        title="Move down"
                                        className="text-stone-300 hover:text-stone-700 disabled:opacity-20"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>

                                  {/* Dish Info & Thumbnail */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                                        {dish.imageUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={dish.imageUrl}
                                            alt={dish.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <Box className="w-5 h-5 text-stone-300 m-auto mt-2.5" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-stone-900">{dish.name}</p>
                                        <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                                          {dish.description || "No description"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Category */}
                                  <td className="py-3 px-4 text-stone-600 font-medium">
                                    {group.category.name}
                                  </td>

                                  {/* Price (Inline Editable) */}
                                  <td className="py-3 px-4">
                                    {editingPriceId === dish.id ? (
                                      <input
                                        type="number"
                                        step="0.1"
                                        autoFocus
                                        value={inlinePriceValue}
                                        onChange={(e) => setInlinePriceValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleSaveInlinePrice(dish.id);
                                          if (e.key === "Escape") setEditingPriceId(null);
                                        }}
                                        onBlur={() => handleSaveInlinePrice(dish.id)}
                                        className="w-16 px-1.5 py-0.5 text-xs font-bold border border-amber-500 rounded focus:outline-none"
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPriceId(dish.id);
                                          setInlinePriceValue(dish.price.toString());
                                        }}
                                        className="font-bold text-stone-900 hover:text-amber-600 hover:underline"
                                      >
                                        ${dish.price.toFixed(2)}
                                      </button>
                                    )}
                                  </td>

                                  {/* 3D Asset Status */}
                                  <td className="py-3 px-4">
                                    {has3D ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewDish3D(dish)}
                                        className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200 inline-flex items-center gap-1 hover:bg-purple-200"
                                      >
                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                        <span>3D Ready</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-stone-400 font-medium">
                                        No 3D Model
                                      </span>
                                    )}
                                  </td>

                                  {/* Stock Status Toggle */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAvailability(dish)}
                                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                          isStock ? "bg-emerald-500" : "bg-stone-300"
                                        }`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                            isStock ? "translate-x-4" : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                      <span className={`text-[11px] font-semibold ${
                                        isStock ? "text-emerald-700" : "text-stone-400"
                                      }`}>
                                        {isStock ? "In Stock" : "86'd"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Telemetry / Metrics */}
                                  <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                                    {Math.floor((dish.displayOrder || 1) * 38 + 14)} scans
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDish(dish);
                                          setIsDrawerOpen(true);
                                        }}
                                        title="Edit Dish"
                                        className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      {has3D && (
                                        <button
                                          type="button"
                                          onClick={() => setPreviewDish3D(dish)}
                                          title="Preview 3D"
                                          className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                                        >
                                          <Sparkles className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDish(dish)}
                                        title="Delete Dish"
                                        className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* 4. Slide-Over Drawer: Add / Edit Dish */}
        <DishDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingDish(null);
          }}
          dishToEdit={editingDish}
          categories={categories}
          currency="USD"
          onSave={handleSaveDrawerDish}
        />

        {/* 5. 3D / AR In-Browser Diagnostic Preview Modal */}
        <DishPreview3DModal
          dish={previewDish3D}
          isOpen={Boolean(previewDish3D)}
          onClose={() => setPreviewDish3D(null)}
        />
      </div>
    </DashboardLayout>
  );
}

