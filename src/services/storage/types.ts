export interface UploadOptions {
  folder: "images" | "logos" | "models" | "qr";
  fileName: string;
  contentType: string;
}

export interface StoredFile {
  key: string;
  url: string;
  sizeBytes: number;
}

export interface IStorageService {
  upload(buffer: Buffer | Uint8Array, options: UploadOptions): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
