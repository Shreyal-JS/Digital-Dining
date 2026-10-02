"use client";

import React, { useState, useEffect } from "react";
import { Dish, Category } from "@/types";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  X,
  Upload,
  Sparkles,
  AlertCircle,
  ImageIcon,
  Box,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  Scale,
} from "lucide-react";

interface DishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dishToEdit: Dish | null;
  categories: Category[];
  currency?: string;
  onSave: (dishData: Partial<Dish>, imageFile?: File | null, modelFile?: File | null) => Promise<void>;
}

const DIETARY_TAG_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Egg-Free",
  "Keto-Friendly",
];

export const DishDrawer: React.FC<DishDrawerProps> = ({
  isOpen,
  onClose,
  dishToEdit,
  categories,
  currency = "USD",
  onSave,
}) => {
  const isEditing = Boolean(dishToEdit);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [portion, setPortion] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [allergens, setAllergens] = useState("");
  const [dietaryType, setDietaryType] = useState<Dish["dietaryType"]>("VEGETARIAN");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [model3dUrl, setModel3dUrl] = useState("");
  const [arEnabled, setArEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [publishStatus, setPublishStatus] = useState<"ACTIVE" | "DRAFT" | "SEASONAL">("ACTIVE");

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate fields when drawer opens
  useEffect(() => {
    if (dishToEdit) {
      setName(dishToEdit.name);
      setDescription(dishToEdit.description || "");
      setCategoryId(dishToEdit.categoryId);
      setPrice(dishToEdit.price);
      setPortion(dishToEdit.portion || "");
      setIngredients(dishToEdit.ingredients || "");
      setAllergens(dishToEdit.allergens || "");
      setDietaryType(dishToEdit.dietaryType || "VEGETARIAN");
      setImageUrl(dishToEdit.imageUrl || "");
      setImagePreview(dishToEdit.imageUrl || null);
      setModel3dUrl(dishToEdit.model3dUrl || "");
      setArEnabled(dishToEdit.arEnabled || false);
      setIsAvailable(dishToEdit.isAvailable);
      setPublishStatus(dishToEdit.isAvailable ? "ACTIVE" : "DRAFT");

      // Extract existing dietary tags from allergens or dietary type
      const detectedTags: string[] = [];
      if (dishToEdit.dietaryType === "VEGAN") detectedTags.push("Vegan");
      if (dishToEdit.dietaryType === "VEGETARIAN") detectedTags.push("Vegetarian");
      if (dishToEdit.allergens?.toLowerCase().includes("gluten")) detectedTags.push("Gluten-Free");
      if (dishToEdit.allergens?.toLowerCase().includes("dairy")) detectedTags.push("Dairy-Free");
      if (dishToEdit.allergens?.toLowerCase().includes("nut")) detectedTags.push("Nut-Free");
      setSelectedTags(Array.from(new Set(detectedTags)));
    } else {
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setPrice("");
      setPortion("");
      setIngredients("");
      setAllergens("");
      setDietaryType("VEGETARIAN");
      setSelectedTags(["Vegetarian"]);
      setImageUrl("");
      setImagePreview(null);
      setModel3dUrl("");
      setArEnabled(false);
      setIsAvailable(true);
      setPublishStatus("ACTIVE");
      setImageFile(null);
      setModelFile(null);
    }
    setErrorMessage(null);
  }, [dishToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (JPEG, PNG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image file exceeds the 5MB size limit.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "glb" && ext !== "gltf" && ext !== "usdz") {
        setErrorMessage("3D model must be .glb, .gltf, or .usdz format.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("3D model exceeds 15MB maximum web threshold.");
        return;
      }
      setModelFile(file);
      setModel3dUrl(file.name);
      setArEnabled(true);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Dish name is required.");
      return;
    }
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Please enter a valid positive price.");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      // Map dietary tags into allergens or dietaryType
      let mappedDietaryType = dietaryType;
      if (selectedTags.includes("Vegan")) mappedDietaryType = "VEGAN";
      else if (selectedTags.includes("Vegetarian")) mappedDietaryType = "VEGETARIAN";

      const dishPayload: Partial<Dish> = {
        name: name.trim(),
        description: description.trim() || null,
        categoryId,
        price: numPrice,
        portion: portion.trim() || null,
        ingredients: ingredients.trim() || null,
        allergens: allergens.trim() || null,
        dietaryType: mappedDietaryType,
        imageUrl: imageFile ? undefined : imageUrl || null,
        model3dUrl: modelFile ? undefined : model3dUrl || null,
        arEnabled,
        isAvailable: publishStatus === "ACTIVE" ? isAvailable : false,
      };

      await onSave(dishPayload, imageFile, modelFile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save dish. Please check the inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out border-l border-stone-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {isEditing ? "Edit Dish" : "Create Dish"}
              </span>
              {dishToEdit && (
                <span className="text-xs text-stone-400 font-mono">ID: {dishToEdit.id}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-1">
              {dishToEdit ? dishToEdit.name : "Add New Dish"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-stone-400" /> Basic Details
            </h3>

            <div className="space-y-3">
              <Input
                label="Dish Name *"
                placeholder="e.g. Heirloom Tomato Bruschetta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Base Price ({currency}) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-stone-400 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 pl-7 pr-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Appetizing description detailing flavors, cooking method, and origin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Portion / Servings"
                  placeholder="e.g. 3 Pieces (220g), Serves 1-2"
                  value={portion}
                  onChange={(e) => setPortion(e.target.value)}
                />
                <Input
                  label="Allergen Notice"
                  placeholder="e.g. Contains Gluten, Dairy, Nuts"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Key Ingredients
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rustic Sourdough, Heirloom Tomatoes, Basil, Garlic"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dietary & Allergen Multi-select Chips */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-stone-400" /> Dietary Tags & Classification
            </h3>
            <p className="text-xs text-stone-500">
              Select all dietary badges that should appear on customer menu cards.
            </p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      active
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Digital Assets (Photo & 3D Model) */}
          <div className="space-y-4 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> Digital Assets
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 3D / AR Ready
              </span>
            </div>

            {/* Food Photography Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Food Photography</label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-stone-300" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Choose Image File...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-400">
                    Square or 16:9 aspect ratio recommended. JPG, PNG, WebP up to 5MB.
                  </p>
                  <input
                    type="text"
                    placeholder="Or enter direct image URL..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (!imageFile) setImagePreview(e.target.value || null);
                    }}
                    className="w-full rounded-md border border-stone-200 px-2.5 py-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3D Model Uploader (.glb, .usdz) */}
            <div className="space-y-2 bg-purple-50/50 p-4 rounded-xl border border-purple-200/70">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-purple-600" /> 3D Model File (.glb, .usdz)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={arEnabled}
                    onChange={(e) => setArEnabled(e.target.checked)}
                    className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-medium text-purple-800">Enable Diner AR</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-purple-200 rounded-lg p-3.5 text-center bg-white hover:bg-purple-50/30 transition-colors">
                <input
                  type="file"
                  accept=".glb,.gltf,.usdz"
                  onChange={handleModelFileChange}
                  id="model-file-input"
                  className="hidden"
                />
                <label htmlFor="model-file-input" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-purple-900">
                    {modelFile ? modelFile.name : model3dUrl ? model3dUrl : "Upload .glb or .usdz file"}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Drag and drop or browse files (Max 15MB)
                  </p>
                </label>
              </div>

              {/* Polygon & Optimization Warning */}
              <div className="flex items-start gap-2 text-[11px] text-purple-700 bg-purple-100/60 p-2.5 rounded-lg border border-purple-200/50">
                <AlertCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Asset Guidelines:</strong> Keep polygon count under 50,000 and textures compressed for mobile 60fps WebXR performance.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Visibility & Publish Status */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-stone-400" /> Visibility & Availability
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPublishStatus("ACTIVE");
                  setIsAvailable(true);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  publishStatus === "ACTIVE"
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500"
                    : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Active</span>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-stone-500">Live on public diner menu</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPublishStatus("DRAFT");
                  setIsAvailable(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  publishStatus === "DRAFT"
                    ? "border-amber-500 bg-amber-50/60 text-amber-900 ring-1 ring-amber-500"
                    : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Hidden / Draft</span>
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-[11px] text-stone-500">Temporarily hidden</p>
              </button>

              <button
                type="button"
                onClick={() => setPublishStatus("SEASONAL")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  publishStatus === "SEASONAL"
                    ? "border-sky-500 bg-sky-50/60 text-sky-900 ring-1 ring-sky-500"
                    : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Seasonal</span>
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <p className="text-[11px] text-stone-500">Scheduled menu item</p>
              </button>
            </div>

            {/* Instant Availability Toggle Switch */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Instant Kitchen Availability</span>
                <span className="text-[11px] text-stone-500">
                  {isAvailable ? "Item is in stock and orderable" : "Item is marked 86'd (Sold Out)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-emerald-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="text-stone-600 hover:text-stone-900">
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 shadow-xs"
            >
              {isEditing ? "Save Changes" : "+ Create Dish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
