export type ArSupportStatus = "AR_SUPPORTED" | "ONLY_3D" | "FALLBACK_PHOTO";

export interface ModelValidationResult {
  isValid: boolean;
  fileSizeBytes: number;
  format: "glb" | "gltf" | "usdz" | "unsupported";
  errorMessage?: string;
}

export interface IArService {
  validateModel(fileBuffer: Buffer | ArrayBuffer, fileName: string): Promise<ModelValidationResult>;
  determineCapability(hasModel: boolean, isArEnabled: boolean, userAgent?: string): ArSupportStatus;
}
