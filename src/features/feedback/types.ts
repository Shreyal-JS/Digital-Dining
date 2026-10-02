import { Feedback, FeedbackReply } from "@/types";

export interface CreateFeedbackDTO {
  restaurantId: string;
  dishId?: string | null;
  rating: number;
  comment?: string | null;
  languageCode?: string;
}

export interface IFeedbackService {
  submitFeedback(dto: CreateFeedbackDTO): Promise<Feedback>;
  listFeedback(restaurantId: string, dishId?: string): Promise<Feedback[]>;
  addStaffReply(restaurantId: string, feedbackId: string, reply: FeedbackReply): Promise<Feedback>;
}
