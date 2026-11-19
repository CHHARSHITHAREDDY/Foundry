import { IdeaBrief } from "@venture-studio/contracts";

export class IdeaCacheService {
  private cache = new Map<string, IdeaBrief>();
  private candidateQueue: string[] = [];

  setIdea(idea: IdeaBrief) {
    this.cache.set(idea.id, idea);
  }

  getIdea(id: string): IdeaBrief | undefined {
    return this.cache.get(id);
  }

  setCandidates(ideas: IdeaBrief[]) {
    for (const idea of ideas) {
      this.cache.set(idea.id, idea);
    }
    this.candidateQueue = ideas.map((i) => i.id);
  }

  getNextCandidate(currentId?: string): IdeaBrief | undefined {
    if (this.candidateQueue.length === 0) return undefined;

    if (!currentId) {
      const firstId = this.candidateQueue[0];
      return firstId ? this.cache.get(firstId) : undefined;
    }

    const currentIndex = this.candidateQueue.indexOf(currentId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % this.candidateQueue.length : 0;
    const nextId = this.candidateQueue[nextIndex];

    return nextId ? this.cache.get(nextId) : undefined;
  }

  listIdeas(): IdeaBrief[] {
    return Array.from(this.cache.values());
  }
}
