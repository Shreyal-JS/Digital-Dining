import { IArService, ModelValidationResult, ArSupportStatus } from "./types";

const MAX_MODEL_SIZE_BYTES = 15 * 1024 * 1024; // 15MB ceiling for mobile web optimization

export class ArServiceStub implements IArService {
  async validateModel(fileBuffer: Buffer | ArrayBuffer, fileName: string): Promise<ModelValidationResult> {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const size = fileBuffer.byteLength;

    if (ext !== "glb" && ext !== "gltf") {
      return {
        isValid: false,
        fileSizeBytes: size,
        format: "unsupported",
        errorMessage: "Only web-optimized .glb and .gltf 3D formats are allowed",
      };
    }

    if (size > MAX_MODEL_SIZE_BYTES) {
      return {
        isValid: false,
        fileSizeBytes: size,
        format: ext as "glb" | "gltf",
        errorMessage: `Model size exceeds ${MAX_MODEL_SIZE_BYTES / (1024 * 1024)}MB mobile threshold`,
      };
    }

    return {
      isValid: true,
      fileSizeBytes: size,
      format: ext as "glb" | "gltf",
    };
  }

  determineCapability(hasModel: boolean, isArEnabled: boolean, userAgent = ""): ArSupportStatus {
    if (!hasModel) {
      return "FALLBACK_PHOTO";
    }

    if (!isArEnabled) {
      return "ONLY_3D";
    }

    // Basic heuristic: mobile devices with WebXR / QuickLook / SceneViewer support
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    return isMobile ? "AR_SUPPORTED" : "ONLY_3D";
  }
}

export const arService: IArService = new ArServiceStub();
