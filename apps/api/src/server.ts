import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { createLogger, registerErrorHandler } from "@venture-studio/service-kit";
import { getApiEnv } from "./config/env.js";

// Core Domain Modules
import { healthRoutes } from "./modules/health/health.routes.js";
import { ideationRoutes } from "./modules/ideation/ideation.routes.js";
import { researchRoutes } from "./modules/research/research.routes.js";
import { runtimeRoutes } from "./modules/agent-runtime/runtime.routes.js";
import { workflowRoutes } from "./modules/workflow/workflow.routes.js";
import { realtimeRoutes } from "./modules/realtime/stream.routes.js";

// Feature Modules
import { authRoutes, devOutboxRoutes } from "./modules/auth/auth.routes.js";
import { billingRoutes, pricingRoutes } from "./modules/billing/billing.routes.js";
import { deployerRoutes } from "./modules/deployer/deployer.routes.js";
import { sandboxRoutes } from "./modules/sandbox/sandbox.routes.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { assistantRoutes } from "./modules/assistant/assistant.routes.js";
import { documentsRoutes } from "./modules/documents/documents.routes.js";
import { emailRoutes } from "./modules/email/email.routes.js";
import { socialRoutes } from "./modules/social/social.routes.js";
import { adsRoutes } from "./modules/ads/ads.routes.js";
import { mediaRoutes } from "./modules/media/media.routes.js";
import { companyPaymentsRoutes } from "./modules/company-payments/payments.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { auditRoutes } from "./modules/audit/audit.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";
import { platformConfigRoutes } from "./modules/platform-config/config.routes.js";
import { moderationRoutes } from "./modules/moderation/moderation.routes.js";
import { adminRoutes } from "./modules/api-admin/admin.routes.js";
import { userRoutes } from "./modules/api-user/user.routes.js";
import { modelGatewayRoutes } from "./modules/model-gateway/gateway.routes.js";
import { reviewRoutes } from "./modules/review/review.routes.js";
import { buildsRoutes } from "./modules/builds/builds.routes.js";
import { companiesRoutes, dashboardRoutes } from "./modules/companies/companies.routes.js";

export async function createApiServer(): Promise<FastifyInstance> {
  const env = getApiEnv();
  const logger = createLogger("@venture-studio/api");

  const app: FastifyInstance = Fastify({
    logger: logger as any,
    genReqId: () => `req_${Math.random().toString(36).substring(2, 9)}`,
    disableRequestLogging: false,
  });

  // Security & Utility Plugins
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(cors, {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(sensible);
  registerErrorHandler(app);

  // Register Core Domain Modules
  await app.register(healthRoutes);
  await app.register(ideationRoutes);
  await app.register(researchRoutes);
  await app.register(runtimeRoutes);
  await app.register(workflowRoutes);
  await app.register(realtimeRoutes);
  await app.register(pricingRoutes);
  await app.register(dashboardRoutes);

  // Register Feature Modules
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(devOutboxRoutes, { prefix: "/api/dev" });
  await app.register(billingRoutes, { prefix: "/api/billing" });
  await app.register(deployerRoutes, { prefix: "/api/deployments" });
  await app.register(sandboxRoutes, { prefix: "/api/sandbox" });
  await app.register(analyticsRoutes, { prefix: "/api/analytics" });
  await app.register(assistantRoutes, { prefix: "/api/assistant" });
  await app.register(documentsRoutes, { prefix: "/api/documents" });
  await app.register(emailRoutes, { prefix: "/api/email" });
  await app.register(socialRoutes, { prefix: "/api/social" });
  await app.register(adsRoutes, { prefix: "/api/ads" });
  await app.register(mediaRoutes, { prefix: "/api/media" });
  await app.register(companyPaymentsRoutes, { prefix: "/api/company-payments" });
  await app.register(notificationsRoutes, { prefix: "/api/notifications" });
  await app.register(auditRoutes, { prefix: "/api/audit" });
  await app.register(tasksRoutes, { prefix: "/api/tasks" });
  await app.register(platformConfigRoutes, { prefix: "/api/platform-config" });
  await app.register(moderationRoutes, { prefix: "/api/moderation" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(userRoutes, { prefix: "/api/user" });
  await app.register(modelGatewayRoutes, { prefix: "/api/gateway" });
  await app.register(reviewRoutes, { prefix: "/api/review" });
  await app.register(buildsRoutes, { prefix: "/api/builds" });
  await app.register(companiesRoutes, { prefix: "/api/companies" });

  return app;
}
