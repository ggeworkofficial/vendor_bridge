import { z } from "zod";

export const createLogisticsValidation = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  carrier: z.string().min(1, "Carrier name is required"),
  tracking_number: z.string().min(1, "Tracking number is required"),
  status: z.enum(["processing", "in_transit", "out_for_delivery", "delivered"]),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  estimated_eta: z.string().min(1, "Estimated ETA is required"),
});

export type CreateLogisticsFormData = z.infer<typeof createLogisticsValidation>;
