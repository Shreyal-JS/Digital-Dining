import { QrCode } from "@/types";

export interface GenerateQrDTO {
  restaurantId: string;
  slug: string;
  identifier?: string;
}

export interface IQrService {
  getMenuUrl(slug: string): string;
  generateQrCode(dto: GenerateQrDTO): Promise<QrCode>;
  listQrCodes(restaurantId: string): Promise<QrCode[]>;
}
