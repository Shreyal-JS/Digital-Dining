import { NextRequest } from "next/server";
import { restaurantService } from "@/features/restaurants/restaurant.service";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const lang = req.nextUrl.searchParams.get("lang") || undefined;
    const menu = await restaurantService.getPublicMenu(params.slug, lang);

    if (!menu) {
      return notFoundResponse("Restaurant menu not found");
    }

    return successResponse(menu);
  } catch (err: any) {
    return serverErrorResponse("Failed to fetch public menu", err);
  }
}
