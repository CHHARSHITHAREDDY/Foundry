export interface GeneratedDoc {
  id: string;
  type: "prd" | "openapi" | "terms" | "privacy";
  title: string;
  content: string;
}

export class DocumentsService {
  async generateDoc(type: GeneratedDoc["type"], ventureTitle: string): Promise<GeneratedDoc> {
    return {
      id: `doc_${Date.now()}`,
      type,
      title: `${ventureTitle} - ${type.toUpperCase()}`,
      content: `# ${ventureTitle} ${type.toUpperCase()}\n\nGenerated automatically by Foundry Archival Engine.`,
    };
  }
}

export const documentsService = new DocumentsService();
