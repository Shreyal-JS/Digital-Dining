import { IStorageService, UploadOptions, StoredFile } from "./types";

export class StorageServiceStub implements IStorageService {
  private baseUrl = process.env.STORAGE_PUBLIC_BASE_URL || "http://localhost:3000/uploads";

  async upload(buffer: Buffer | Uint8Array, options: UploadOptions): Promise<StoredFile> {
    const sanitizedName = options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueKey = `${options.folder}/${Date.now()}_${sanitizedName}`;

    // Stub implementation: Returns accessible public URL
    // In production: Streams buffer to AWS S3, Cloudflare R2, or local disk
    return {
      key: uniqueKey,
      url: `${this.baseUrl}/${uniqueKey}`,
      sizeBytes: buffer.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    void key;
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

export const storageService: IStorageService = new StorageServiceStub();
