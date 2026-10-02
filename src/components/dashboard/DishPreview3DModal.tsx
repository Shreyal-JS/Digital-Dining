"use client";

import React, { useState } from "react";
import { Dish } from "@/types";
import { Button } from "@/components/common/Button";
import { X, Sparkles, Box, Smartphone, CheckCircle2, AlertTriangle, RefreshCw, ZoomIn } from "lucide-react";

interface DishPreview3DModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DishPreview3DModal: React.FC<DishPreview3DModalProps> = ({ dish, isOpen, onClose }) => {
  const [wireframeMode, setWireframeMode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(45);

  if (!isOpen || !dish) return null;

  const hasModel = Boolean(dish.model3dUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-stone-900 border border-stone-800 text-stone-100 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {dish.name}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {hasModel ? "3D Ready" : "Missing Model"}
                </span>
              </h3>
              <p className="text-xs text-stone-400">Manager 3D & Augmented Reality Diagnostic Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close 3D preview"
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Viewport Stage */}
        <div className="relative w-full h-72 bg-gradient-to-b from-stone-950 to-stone-900 rounded-xl my-4 border border-stone-800 flex flex-col items-center justify-center overflow-hidden">
          {hasModel ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
              {/* Animated 3D Simulation Frame */}
              <div
                className="w-36 h-36 rounded-2xl border-2 border-dashed border-purple-500/40 flex items-center justify-center bg-stone-800/40 relative shadow-inner cursor-grab active:cursor-grabbing transition-transform duration-300"
                style={{ transform: `rotateY(${rotationAngle}deg)` }}
                onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                title="Click to rotate model"
              >
                <Box
                  className={`w-16 h-16 text-purple-400 transition-all ${
                    wireframeMode ? "stroke-1 text-purple-300 animate-spin" : "stroke-2"
                  }`}
                  style={{ animationDuration: "12s" }}
                />
                <span className="absolute -bottom-2 bg-stone-900 px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 border border-purple-500/30">
                  {rotationAngle}° Orbit
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 text-xs py-1 px-2.5 h-auto"
                  onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" /> Rotate 90°
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-xs py-1 px-2.5 h-auto border-stone-700 ${
                    wireframeMode ? "bg-purple-950 text-purple-200 border-purple-500/50" : "bg-stone-800 text-stone-300"
                  }`}
                  onClick={() => setWireframeMode(!wireframeMode)}
                >
                  <ZoomIn className="w-3 h-3 mr-1.5" /> {wireframeMode ? "Shaded Mesh" : "Wireframe"}
                </Button>
              </div>

              {/* Status pill on bottom right */}
              <div className="absolute bottom-3 right-3 text-[11px] font-mono bg-stone-900/90 border border-stone-800 px-2 py-1 rounded text-stone-400">
                Asset: {dish.model3dUrl}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-200">No 3D Model Attached</p>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Upload a <code className="text-amber-400 font-mono">.glb</code> or <code className="text-amber-400 font-mono">.usdz</code> asset in the Edit Dish drawer to enable diner AR projection.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Technical Asset Diagnostics */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-stone-950/60 rounded-xl border border-stone-800/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">WebXR AR</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-stone-300 font-medium">
              {dish.arEnabled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Enabled
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 text-stone-500" /> Disabled
                </>
              )}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Format</span>
            <span className="text-stone-300 font-medium mt-0.5 block font-mono text-[11px]">
              {dish.model3dUrl?.endsWith(".glb") ? "GLTF / GLB" : dish.model3dUrl ? "3D Mesh" : "None"}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">Diner Fallback</span>
            <span className="text-stone-300 font-medium mt-0.5 block">2D Photo</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-800">
          <p className="text-xs text-stone-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            Live test available on mobile via <span className="font-mono text-stone-300">/r/olive-grove</span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-stone-400 hover:text-white" onClick={onClose}>
              Done
            </Button>
            {hasModel && (
              <Button
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  window.open(`/r/olive-grove`, "_blank");
                }}
              >
                Test Diner View
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

