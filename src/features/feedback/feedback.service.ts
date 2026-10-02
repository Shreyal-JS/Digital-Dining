import { IFeedbackService, CreateFeedbackDTO } from "./types";
import { Feedback } from "@/types";
import { MOCK_FEEDBACK } from "@/database/mock-data";

export class FeedbackServiceStub implements IFeedbackService {
  private feedbackList: Feedback[] = [...MOCK_FEEDBACK];

  async submitFeedback(dto: CreateFeedbackDTO): Promise<Feedback> {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const newFeedback: Feedback = {
      id: `fb_${Date.now()}`,
      restaurantId: dto.restaurantId,
      dishId: dto.dishId || null,
      rating: dto.rating,
      comment: dto.comment || null,
      languageCode: dto.languageCode || "en",
      createdAt: new Date(),
    };

    this.feedbackList.unshift(newFeedback);
    return newFeedback;
  }

  async listFeedback(restaurantId: string, dishId?: string): Promise<Feedback[]> {
    return this.feedbackList.filter((f) => {
      const matchRest = f.restaurantId === restaurantId;
      return dishId ? matchRest && f.dishId === dishId : matchRest;
    });
  }

  async addStaffReply(restaurantId: string, feedbackId: string, reply: import("@/types").FeedbackReply): Promise<Feedback> {
    const feedback = this.feedbackList.find((f) => f.id === feedbackId && f.restaurantId === restaurantId);
    if (!feedback) {
      throw new Error("Feedback record not found or does not belong to restaurant");
    }

    if (!feedback.staffReplies) {
      feedback.staffReplies = [];
    }

    feedback.staffReplies.push({
      ...reply,
      id: `rep_${Date.now()}`,
      createdAt: new Date(),
    });

    return feedback;
  }
}

export const feedbackService: IFeedbackService = new FeedbackServiceStub();
