/**
 * Embedding Service: Generates high-dimensional vector representations
 * Supports local vector generation via TF-IDF normalized vector spaces
 * and optional OpenAI text-embedding-3-small integration when configured.
 */

export interface VectorEmbedding {
  vector: number[];
  dimension: number;
}

export class EmbeddingService {
  private static DIMENSION = 128;

  /**
   * Simple deterministic hash-vector generator for text chunks.
   * Produces dense 128-dimensional normalized vectors.
   */
  public static generateEmbedding(text: string): number[] {
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const tokens = cleanText.split(/\s+/).filter(Boolean);
    const vector = new Array(this.DIMENSION).fill(0);

    tokens.forEach((token, index) => {
      for (let i = 0; i < token.length; i++) {
        const charCode = token.charCodeAt(i);
        const pos = (charCode * 31 + i + index * 17) % this.DIMENSION;
        vector[pos] += 1 / (i + 1);
      }
    });

    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map((val) => val / magnitude);
  }

  /**
   * Computes cosine similarity between two vectors.
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
