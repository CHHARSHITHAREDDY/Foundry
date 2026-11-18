export type TaskStatus = "RUNNING" | "QUEUED" | "NEEDS_APPROVAL" | "DONE" | "FAILED";
export type TaskType = "FEATURE" | "BUG" | "CONTENT" | "MARKETING";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export interface SprintTask {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  credits: number;
  progress?: number;
  timeElapsed?: string;
  assignedAgent?: string;
  completedAt?: string;
  diffStats?: { added: number; removed: number };
  requiresApproval?: boolean;
  createdAt: string;
  updatedAt: string;
}

const SEED_TASKS: SprintTask[] = [
  {
    id: "tsk-043",
    code: "#043",
    title: "Shopify GraphQL Webhook Exponential Backoff & Retry Queue",
    description: "Incorporate Redis BullMQ retry queue with jittered exponential delay on 429 Shopify Admin rate limits.",
    status: "RUNNING",
    type: "FEATURE",
    priority: "P0",
    credits: 3,
    progress: 72,
    timeElapsed: "16m 38s",
    assignedAgent: "Ember-02",
    createdAt: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tsk-042",
    code: "#042",
    title: "Margin Threshold Breach Email Alert to Merchant Store Owner",
    description: "Send instant transactional email via Resend when gross product margin drops below configured slider floor.",
    status: "NEEDS_APPROVAL",
    type: "FEATURE",
    priority: "P1",
    credits: 2,
    diffStats: { added: 84, removed: 12 },
    assignedAgent: "Ember-01",
    requiresApproval: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tsk-041",
    code: "#041",
    title: "Slack Channel Incoming Webhook Integration for Price Drop Notifications",
    description: "Allow merchants to paste Slack incoming webhook URL to broadcast pricing shifts to their internal teams.",
    status: "QUEUED",
    type: "FEATURE",
    priority: "P2",
    credits: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tsk-040",
    code: "#040",
    title: "Dual-Thumb Polaris Range Slider Component Ast Patch",
    description: "Replace standard HTML range input with Shopify Polaris themed dual slider with live dollar floor calculation.",
    status: "DONE",
    type: "FEATURE",
    priority: "P1",
    credits: 3,
    completedAt: "Today 11:20",
    diffStats: { added: 142, removed: 28 },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tsk-039",
    code: "#039",
    title: "HMAC Sha256 Webhook Timing Attack Guard",
    description: "Enforce crypto.timingSafeEqual comparison on Shopify webhook headers to prevent timing leaks.",
    status: "DONE",
    type: "BUG",
    priority: "P1",
    credits: 2,
    completedAt: "Today 10:15",
    diffStats: { added: 31, removed: 4 },
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class TasksService {
  private tasks: Map<string, SprintTask> = new Map();
  private counter: number = 44;

  constructor() {
    for (const t of SEED_TASKS) {
      this.tasks.set(t.id, t);
    }
  }

  listTasks(filter?: string): SprintTask[] {
    const all = Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!filter || filter === "ALL") return all;
    return all.filter((t) => t.status === filter);
  }

  getTask(id: string): SprintTask | null {
    return this.tasks.get(id) || null;
  }

  createSprintTask(data: {
    specification: string;
    type?: TaskType;
    priority?: TaskPriority;
    credits?: number;
    requiresApproval?: boolean;
    companyName?: string;
  }): SprintTask {
    const id = `tsk-${Date.now()}`;
    const code = `#0${this.counter++}`;
    const type: TaskType = data.type || "FEATURE";
    const priority: TaskPriority = data.priority || "P1";
    const credits = data.credits || (type === "FEATURE" ? 3 : 2);

    const title =
      data.specification.length > 60
        ? data.specification.slice(0, 60) + "..."
        : data.specification;

    const task: SprintTask = {
      id,
      code,
      title,
      description: data.specification,
      status: "QUEUED",
      type,
      priority,
      credits,
      requiresApproval: data.requiresApproval ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(id, task);
    return task;
  }

  approveTask(id: string): SprintTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    task.status = "DONE";
    task.completedAt = "Just now";
    task.updatedAt = new Date().toISOString();
    return task;
  }

  cancelTask(id: string): SprintTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    task.status = "FAILED";
    task.updatedAt = new Date().toISOString();
    return task;
  }

  retryTask(id: string): SprintTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    task.status = "RUNNING";
    task.progress = 10;
    task.updatedAt = new Date().toISOString();
    return task;
  }
}

export const tasksService = new TasksService();
