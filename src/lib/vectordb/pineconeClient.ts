'use client';

import { Pinecone } from '@pinecone-database/pinecone';

// Define vector types
export interface DrawingVector {
  id: string;
  values: number[];
  metadata: {
    userId: string;
    drawingId: string;
    name: string;
    description?: string;
    tags?: string[];
    createdAt: string;
    imageUrl?: string;
    isPublic: boolean;
  };
}

// Pinecone client
class PineconeClient {
  private client: Pinecone | null = null;
  private apiKey: string | null = null;
  private indexName: string = 'drawings';
  private namespace: string = 'default';

  constructor() {
    // Initialize with environment variable if available
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PINECONE_API_KEY) {
      this.apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
      this.initClient();
    }
  }

  // Initialize the Pinecone client
  private async initClient(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Pinecone API key is required');
    }

    try {
      this.client = new Pinecone({
        apiKey: this.apiKey,
      });
    } catch (error) {
      console.error('Error initializing Pinecone client:', error);
      throw error;
    }
  }

  // Set API key
  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await this.initClient();
  }

  // Get API key
  getApiKey(): string | null {
    return this.apiKey;
  }

  // Set index name
  setIndexName(indexName: string): void {
    this.indexName = indexName;
  }

  // Set namespace
  setNamespace(namespace: string): void {
    this.namespace = namespace;
  }

  // Check if client is initialized
  isInitialized(): boolean {
    return this.client !== null;
  }

  // Get index
  private getIndex() {
    if (!this.client) {
      throw new Error('Pinecone client is not initialized');
    }

    return this.client.index(this.indexName);
  }

  // Upsert vectors
  async upsertVectors(vectors: DrawingVector[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Pinecone client is not initialized');
    }

    const index = this.getIndex();

    try {
      await index.upsert(vectors.map(vector => ({
        id: vector.id,
        values: vector.values,
        metadata: vector.metadata,
      })));
    } catch (error) {
      console.error('Error upserting vectors:', error);
      throw error;
    }
  }

  // Query similar vectors
  async querySimilarVectors(
    queryVector: number[],
    options: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    } = {}
  ): Promise<DrawingVector[]> {
    if (!this.isInitialized()) {
      throw new Error('Pinecone client is not initialized');
    }

    const {
      topK = 10,
      filter = {},
      includeMetadata = true,
    } = options;

    const index = this.getIndex();

    try {
      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        filter,
        includeMetadata,
      });

      return queryResponse.matches.map(match => ({
        id: match.id,
        values: match.values || [],
        metadata: match.metadata as DrawingVector['metadata'],
      }));
    } catch (error) {
      console.error('Error querying similar vectors:', error);
      throw error;
    }
  }

  // Delete vectors
  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Pinecone client is not initialized');
    }

    const index = this.getIndex();

    try {
      await index.deleteMany(ids);
    } catch (error) {
      console.error('Error deleting vectors:', error);
      throw error;
    }
  }

  // Delete vectors by filter
  async deleteVectorsByFilter(filter: Record<string, any>): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Pinecone client is not initialized');
    }

    const index = this.getIndex();

    try {
      await index.deleteMany({
        filter,
      });
    } catch (error) {
      console.error('Error deleting vectors by filter:', error);
      throw error;
    }
  }

  // List indexes
  async listIndexes(): Promise<string[]> {
    if (!this.isInitialized()) {
      throw new Error('Pinecone client is not initialized');
    }

    try {
      const indexes = await this.client!.listIndexes();
      return indexes.map(index => index.name);
    } catch (error) {
      console.error('Error listing indexes:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const pineconeClient = new PineconeClient();

export default pineconeClient;