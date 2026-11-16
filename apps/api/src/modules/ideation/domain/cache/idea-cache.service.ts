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

    const filtered = currentId
      ? this.candidateQueue.filter((id) => id !== currentId)
      : this.candidateQueue;

    const nextId = filtered[0] || this.candidateQueue[0];
    if (!nextId) return undefined;
    return this.cache.get(nextId);
  }

  listIdeas(): IdeaBrief[] {
    return Array.from(this.cache.values());
  }
}
