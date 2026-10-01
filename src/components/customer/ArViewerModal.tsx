import React from "react";
import { PublicDishItem } from "@/types";
import { Button } from "@/components/common/Button";
import { X, Box, Info } from "lucide-react";

interface ArViewerModalProps {
  dish: PublicDishItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArViewerModal: React.FC<ArViewerModalProps> = ({ dish, isOpen, onClose }) => {
  if (!isOpen || !dish) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="bg-stone-900 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative flex flex-col items-center">
        <button
          onClick={onClose}
          aria-label="Close 3D viewer"
          className="absolute top-4 right-4 text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 mt-2">
          <Box className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-center">{dish.name}</h3>
        <p className="text-xs text-stone-400 text-center mt-1">3D / Augmented Reality Viewer</p>

        {/* 3D Canvas / Model-Viewer Container Placeholder */}
        <div className="w-full h-52 bg-stone-800 rounded-xl my-5 flex flex-col items-center justify-center border border-stone-700/60 p-4 text-center">
          <p className="text-xs font-mono text-stone-300">Target Model: {dish.model3dUrl || "None"}</p>
          <span className="text-[11px] text-stone-400 mt-2">
            Integrates standard Google &lt;model-viewer&gt; or Three.js WebXR canvas in Phase 3.
          </span>
        </div>

        {/* Fallback & Device Info */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-6 bg-stone-800/60 p-3 rounded-lg border border-stone-800">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>Tap below to project this dish on your table surface using native AR.</span>
        </div>

        <div className="w-full space-y-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              // Stub AR activation trigger
              alert(`Launching AR scene for ${dish.name}`);
            }}
          >
            Launch AR Camera
          </Button>
          <Button variant="ghost" className="w-full text-stone-400 hover:text-white" onClick={onClose}>
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
