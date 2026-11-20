import { IdeaBrief } from "@venture-studio/contracts";

export class IdeaCacheService {
  private static instance: IdeaCacheService;
  private cache = new Map<string, IdeaBrief>();
  private candidateQueue: string[] = [];
  private seenIdeaTitles = new Set<string>();

  public static getInstance(): IdeaCacheService {
    if (!IdeaCacheService.instance) {
      IdeaCacheService.instance = new IdeaCacheService();
    }
    return IdeaCacheService.instance;
  }

  setIdea(idea: IdeaBrief): void {
    this.cache.set(idea.id, idea);
    this.seenIdeaTitles.add(idea.title.toLowerCase().trim());
  }

  getIdea(id: string): IdeaBrief | undefined {
    return this.cache.get(id);
  }

  setCandidates(ideas: IdeaBrief[]): void {
    for (const idea of ideas) {
      this.cache.set(idea.id, idea);
      this.seenIdeaTitles.add(idea.title.toLowerCase().trim());
    }
    this.candidateQueue = ideas.map((i) => i.id);
  }

  appendCandidates(ideas: IdeaBrief[]): void {
    for (const idea of ideas) {
      if (!this.cache.has(idea.id)) {
        this.cache.set(idea.id, idea);
        this.seenIdeaTitles.add(idea.title.toLowerCase().trim());
        this.candidateQueue.push(idea.id);
      }
    }
  }

  getNextCandidate(currentId?: string): IdeaBrief | undefined {
    if (this.candidateQueue.length === 0) return undefined;

    if (!currentId) {
      const firstId = this.candidateQueue[0];
      return firstId ? this.cache.get(firstId) : undefined;
    }

    const idx = this.candidateQueue.indexOf(currentId);
    if (idx === -1) {
      const firstId = this.candidateQueue[0];
      return firstId ? this.cache.get(firstId) : undefined;
    }

    const nextIdx = idx + 1;
    if (nextIdx >= this.candidateQueue.length) {
      // Reached end of current batch - return undefined to signal refill needed!
      return undefined;
    }

    const nextId = this.candidateQueue[nextIdx];
    return nextId ? this.cache.get(nextId) : undefined;
  }

  hasSeenTitle(title: string): boolean {
    return this.seenIdeaTitles.has(title.toLowerCase().trim());
  }

  getQueueLength(): number {
    return this.candidateQueue.length;
  }

  getCurrentIndex(currentId?: string): number {
    if (!currentId) return 0;
    return this.candidateQueue.indexOf(currentId);
  }

  listIdeas(): IdeaBrief[] {
    return Array.from(this.cache.values());
  }

  clear(): void {
    this.cache.clear();
    this.candidateQueue = [];
    this.seenIdeaTitles.clear();
  }
}

export const sharedIdeaCache = IdeaCacheService.getInstance();
