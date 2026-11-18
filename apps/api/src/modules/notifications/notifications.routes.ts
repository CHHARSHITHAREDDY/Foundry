import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { notificationsService } from "./services/notifications.service.js";

const SEED_NOTIFS = [
  {
    id: "notif-1",
    type: "BUILD",
    title: "Stage 05 QA Review Gate Passed",
    message: "Daedalus-03 satisfied all 3 invariants with 2 auto-patches applied.",
    timestamp: "12:44",
    read: false,
  },
  {
    id: "notif-2",
    type: "SECURITY",
    title: "HMAC Sha256 Timing Attack Guard Verified",
    message: "Timing safe equality check applied to Shopify webhook receiver.",
    timestamp: "11:15",
    read: false,
  },
  {
    id: "notif-3",
    type: "ALERTS",
    title: "Anycast DNS Propagation Synchronized",
    message: "Cloudflare Edge network routed pricewatch-4k2.foundry.app to 285 PoPs.",
    timestamp: "10:30",
    read: true,
  },
];

let notifList = [...SEED_NOTIFS];

export const notificationsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // List notifications
  app.get("/", async (_req, reply) => {
    return reply.send({ notifications: notifList, unreadCount: notifList.filter((n) => !n.read).length });
  });

  app.get("/list", async (_req, reply) => {
    return reply.send({ notifications: notifList, unreadCount: notifList.filter((n) => !n.read).length });
  });

  // Mark notification read
  app.post("/:id/read", async (req, reply) => {
    const { id } = req.params as { id: string };
    const n = notifList.find((item) => item.id === id);
    if (n) n.read = true;
    return reply.send({ success: true, notification: n });
  });

  // Clear all notifications
  app.post("/clear", async (_req, reply) => {
    notifList = [];
    return reply.send({ success: true, message: "Notifications cleared" });
  });
};
