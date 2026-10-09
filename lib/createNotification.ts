import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { sendPushToUser } from "@/lib/push";

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

  const created = await Notification.create({
    userId,
    customerId,
    title,
    message,
    type,
    isRead: false,
  });

  // Fire-and-forget native push; never blocks or fails the caller.
  void sendPushToUser(userId, title, message);

  return created;
}