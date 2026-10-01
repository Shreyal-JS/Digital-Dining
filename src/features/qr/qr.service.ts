import { IQrService, GenerateQrDTO } from "./types";
import { QrCode } from "@/types";
import { MOCK_QR_CODES } from "@/database/mock-data";

export class QrServiceStub implements IQrService {
  private qrCodes: QrCode[] = [...MOCK_QR_CODES];

  getMenuUrl(slug: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_MENU_BASE_URL || "http://localhost:3000/r";
    return `${baseUrl}/${slug}`;
  }

  async generateQrCode(dto: GenerateQrDTO): Promise<QrCode> {
    const destinationUrl = this.getMenuUrl(dto.slug);
    const identifier = dto.identifier || `QR-${dto.slug.toUpperCase()}-${Date.now().toString(36)}`;

    const newQr: QrCode = {
      id: `qr_${Date.now()}`,
      restaurantId: dto.restaurantId,
      identifier,
      destinationUrl,
      status: "ACTIVE",
      createdAt: new Date(),
    };

    this.qrCodes.push(newQr);
    return newQr;
  }

  async listQrCodes(restaurantId: string): Promise<QrCode[]> {
    return this.qrCodes.filter((qr) => qr.restaurantId === restaurantId);
  }
}

export const qrService: IQrService = new QrServiceStub();
