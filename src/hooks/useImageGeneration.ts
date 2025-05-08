'use client';

import { useState, useCallback } from 'react';
import stableDiffusionClient, { 
  ImageGenerationParams, 
  ImageGenerationResult 
} from '@/lib/ai/stableDiffusion';

interface UseImageGenerationProps {
  onSuccess?: (result: ImageGenerationResult) => void;
  onError?: (error: Error) => void;
}

export const useImageGeneration = ({
  onSuccess,
  onError,
}: UseImageGenerationProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ImageGenerationResult | null>(null);

  // Check if client is initialized
  const isInitialized = useCallback(() => {
    return stableDiffusionClient.isInitialized();
  }, []);

  // Set API key
  const setApiKey = useCallback((apiKey: string) => {
    stableDiffusionClient.setApiKey(apiKey);
  }, []);

  // Generate images
  const generateImages = useCallback(async (params: ImageGenerationParams) => {
    if (!stableDiffusionClient.isInitialized()) {
      const error = new Error('Stable Diffusion client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generationResult = await stableDiffusionClient.generateImages(params);
      setResult(generationResult);
      if (onSuccess) onSuccess(generationResult);
      return generationResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Generate variations
  const generateVariations = useCallback(async (
    imageBase64: string,
    params: Partial<ImageGenerationParams> = {}
  ) => {
    if (!stableDiffusionClient.isInitialized()) {
      const error = new Error('Stable Diffusion client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generationResult = await stableDiffusionClient.generateVariations(imageBase64, params);
      setResult(generationResult);
      if (onSuccess) onSuccess(generationResult);
      return generationResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Upscale image
  const upscaleImage = useCallback(async (imageBase64: string) => {
    if (!stableDiffusionClient.isInitialized()) {
      const error = new Error('Stable Diffusion client is not initialized');
      setError(error);
      if (onError) onError(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const upscaledImage = await stableDiffusionClient.upscaleImage(imageBase64);
      return upscaledImage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  return {
    isLoading,
    error,
    result,
    isInitialized,
    setApiKey,
    generateImages,
    generateVariations,
    upscaleImage,
  };
};

export default useImageGeneration;