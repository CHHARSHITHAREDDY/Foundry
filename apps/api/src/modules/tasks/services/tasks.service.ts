export interface BackgroundTask {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
}

export class TasksService {
  private tasks: Map<string, BackgroundTask> = new Map();

  createTask(name: string): BackgroundTask {
    const task: BackgroundTask = {
      id: `tsk_${Date.now()}`,
      name,
      status: "processing",
      progress: 0,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): BackgroundTask | null {
    return this.tasks.get(id) || null;
  }
}

export const tasksService = new TasksService();
