import { prisma } from '../database/db';
import { EmbeddingService } from './embeddings';

export interface RAGSearchResult {
  id: string;
  docCode: string;
  title: string;
  category: string;
  content: string;
  similarity: number;
  policyCode?: string;
  tags?: string[];
}

export class RAGEngine {
  /**
   * Indexes a document into chunked vector embeddings.
   */
  public async indexDocument(documentId: string, title: string, category: string, content: string) {
    // Delete existing embeddings for document
    await prisma.embedding.deleteMany({
      where: { documentId },
    });

    const chunks = this.chunkText(content, 300);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = EmbeddingService.generateEmbedding(`${title} ${category} ${chunk}`);

      await prisma.embedding.create({
        data: {
          documentId,
          chunkIndex: i,
          content: chunk,
          vectorJson: JSON.stringify(vector),
          metadataJson: JSON.stringify({ title, category, chunkIndex: i }),
        },
      });
    }
  }

  /**
   * Performs semantic RAG vector retrieval over policies, SOPs, and knowledge base.
   */
  public async searchRelevantKnowledge(query: string, topK: number = 3): Promise<RAGSearchResult[]> {
    const queryVector = EmbeddingService.generateEmbedding(query);
    const allEmbeddings = await prisma.embedding.findMany({
      include: {
        document: true,
      },
    });

    const results: Array<RAGSearchResult & { rawScore: number }> = [];

    for (const item of allEmbeddings) {
      try {
        const itemVector: number[] = JSON.parse(item.vectorJson);
        const sim = EmbeddingService.cosineSimilarity(queryVector, itemVector);

        // Keyword boost for exact matches in title or content
        let boost = 0;
        const queryLower = query.toLowerCase();
        if (item.content.toLowerCase().includes(queryLower)) boost += 0.2;
        if (item.document.title.toLowerCase().includes(queryLower)) boost += 0.3;

        const finalScore = Math.min(1.0, sim + boost);

        results.push({
          id: item.document.id,
          docCode: item.document.docCode,
          title: item.document.title,
          category: item.document.category,
          content: item.content,
          similarity: Math.round(finalScore * 100) / 100,
          policyCode: item.document.docCode,
          tags: item.document.tags ? item.document.tags.split(',') : [],
          rawScore: finalScore,
        });
      } catch (err) {
        // Skip malformed vector JSON
      }
    }

    // Sort descending by score
    results.sort((a, b) => b.rawScore - a.rawScore);

    // Deduplicate by title to return rich diverse contexts
    const uniqueMap = new Map<string, RAGSearchResult>();
    for (const res of results) {
      if (!uniqueMap.has(res.title) || uniqueMap.get(res.title)!.similarity < res.similarity) {
        uniqueMap.set(res.title, {
          id: res.id,
          docCode: res.docCode,
          title: res.title,
          category: res.category,
          content: res.content,
          similarity: res.similarity,
          policyCode: res.policyCode,
          tags: res.tags,
        });
      }
    }

    return Array.from(uniqueMap.values()).slice(0, topK);
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > chunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }
}

export const ragEngine = new RAGEngine();
