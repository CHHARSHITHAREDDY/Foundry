export interface NotificationItem {
  id: string;
  type: "build_complete" | "stage_failed" | "credit_low";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export class NotificationsService {
  private items: NotificationItem[] = [
    {
      id: "notif_01",
      type: "build_complete",
      title: "Venture Live",
      message: "VATSentry has been deployed to https://vatsentry.foundry.studio",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  async list(): Promise<NotificationItem[]> {
    return this.items;
  }
}

export const notificationsService = new NotificationsService();
