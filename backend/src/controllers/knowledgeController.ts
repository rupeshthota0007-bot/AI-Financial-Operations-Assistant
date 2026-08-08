import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { ragEngine } from '../rag/ragEngine';

export class KnowledgeController {
  public async getDocuments(req: Request, res: Response) {
    try {
      const documents = await prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, count: documents.length, documents });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async searchKnowledge(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'Query string parameter required' });
      }

      const results = await ragEngine.searchRelevantKnowledge(query, 5);
      return res.json({ success: true, count: results.length, results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createDocument(req: Request, res: Response) {
    try {
      const { docCode, title, category, content, version, tags } = req.body;

      const doc = await prisma.document.create({
        data: {
          docCode: docCode || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          title,
          category,
          content,
          version: version || '1.0',
          tags: tags || null,
        },
      });

      // Index doc in vector database
      await ragEngine.indexDocument(doc.id, doc.title, doc.category, doc.content);

      return res.status(201).json({ success: true, document: doc });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const knowledgeController = new KnowledgeController();
