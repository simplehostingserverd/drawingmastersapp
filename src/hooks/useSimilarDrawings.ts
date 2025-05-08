'use client';

import { useState, useCallback } from 'react';
import pineconeClient, { DrawingVector } from '@/lib/vectordb/pineconeClient';

interface UseSimilarDrawingsProps {
  onSuccess?: (results: DrawingVector[]) => void;
  onError?: (error: Error) => void;
}

export const useSimilarDrawings = ({
  onSuccess,
  onError,
}: UseSimilarDrawingsProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<DrawingVector[]>([]);

  // Check if client is initialized
  const isInitialized = useCallback(() => {
    return pineconeClient.isInitialized();
  }, []);

  // Set API key
  const setApiKey = useCallback(async (apiKey: string) => {
    try {
      await pineconeClient.setApiKey(apiKey);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set API key');
      setError(error);
      if (onError) onError(error);
    }
  }, [onError]);

  // Find similar drawings
  const findSimilarDrawings = useCallback(async (
    queryVector: number[],
    options: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    } = {}
  ) => {
    if (!pineconeClient.isInitialized()) {
      const error = new Error('Pinecone client is not initialized');
      setError(error);
      if (onError) onError(error);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const similarDrawings = await pineconeClient.querySimilarVectors(queryVector, options);
      setResults(similarDrawings);
      if (onSuccess) onSuccess(similarDrawings);
      return similarDrawings;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Store drawing vector
  const storeDrawingVector = useCallback(async (vector: DrawingVector) => {
    if (!pineconeClient.isInitialized()) {
      const error = new Error('Pinecone client is not initialized');
      setError(error);
      if (onError) onError(error);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pineconeClient.upsertVectors([vector]);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Delete drawing vector
  const deleteDrawingVector = useCallback(async (id: string) => {
    if (!pineconeClient.isInitialized()) {
      const error = new Error('Pinecone client is not initialized');
      setError(error);
      if (onError) onError(error);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pineconeClient.deleteVectors([id]);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  return {
    isLoading,
    error,
    results,
    isInitialized,
    setApiKey,
    findSimilarDrawings,
    storeDrawingVector,
    deleteDrawingVector,
  };
};

export default useSimilarDrawings;