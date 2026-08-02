import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";

export async function createNotification({
  userId,
  customerId,
  title,
  message,
  type,
}: {
  userId: string;
  customerId?: string;
  title: string;
  message: string;
  type: string;
}) {
  await connectDB();

  return await Notification.create({
    userId,
    customerId,
    title,
    message,
    type,
    isRead: false,
  });
}