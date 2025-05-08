'use client';

import React, { useState, useRef } from 'react';
import { AnimatedPanel, AnimatedButton } from '@/components/ui/AnimatedComponents';
import stableDiffusionClient, { ImageGenerationParams } from '@/lib/ai/stableDiffusion';

interface AIImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect?: (imageUrl: string) => void;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  isOpen,
  onClose,
  onImageSelect,
}) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [numInferenceSteps, setNumInferenceSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | null>(null);
  const [numImages, setNumImages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!stableDiffusionClient.isInitialized());
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      stableDiffusionClient.setApiKey(apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  // Handle image generation
  const handleGenerateImages = async () => {
    if (!prompt.trim() || isLoading) return;
    
    // Check if Stable Diffusion client is initialized
    if (!stableDiffusionClient.isInitialized()) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params: ImageGenerationParams = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim(),
        width,
        height,
        numInferenceSteps,
        guidanceScale,
        seed: seed !== null ? seed : Math.floor(Math.random() * 4294967295),
        numImages,
      };
      
      const result = await stableDiffusionClient.generateImages(params);
      
      setGeneratedImages(result.images);
      setSeed(result.seed);
      setSelectedImageIndex(null);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image variation generation
  const handleGenerateVariations = async () => {
    if (selectedImageIndex === null || isLoading) return;
    
    // Check if Stable Diffusion client is initialized
    if (!stableDiffusionClient.isInitialized()) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await stableDiffusionClient.generateVariations(
        generatedImages[selectedImageIndex],
        {
          prompt: prompt.trim(),
          numInferenceSteps,
          guidanceScale,
          seed: seed !== null ? seed : Math.floor(Math.random() * 4294967295),
          numImages,
        }
      );
      
      setGeneratedImages(result.images);
      setSeed(result.seed);
      setSelectedImageIndex(null);
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upscaling
  const handleUpscaleImage = async () => {
    if (selectedImageIndex === null || isLoading) return;
    
    // Check if Stable Diffusion client is initialized
    if (!stableDiffusionClient.isInitialized()) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const upscaledImage = await stableDiffusionClient.upscaleImage(
        generatedImages[selectedImageIndex]
      );
      
      // Replace the selected image with the upscaled version
      const newImages = [...generatedImages];
      newImages[selectedImageIndex] = upscaledImage;
      setGeneratedImages(newImages);
    } catch (err) {
      console.error('Error upscaling image:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    
    if (onImageSelect) {
      onImageSelect(generatedImages[index]);
    }
  };

  // Handle image upload for variations
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result as string;
        setGeneratedImages([imageUrl]);
        setSelectedImageIndex(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle random seed
  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 4294967295));
  };

  return (
    <AnimatedPanel isOpen={isOpen} onClose={onClose} direction="right" className="w-96 h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Image Generator</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {showApiKeyInput ? (
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-yellow-800 mb-2">API Key Required</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Please enter your Stability AI API key to use the image generator.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Stability AI API key"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <AnimatedButton onClick={handleApiKeySubmit} variant="primary" size="sm">
            Submit API Key
          </AnimatedButton>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full p-2 border border-gray-300 rounded resize-none h-20"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Negative Prompt
            </label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Describe what you don't want in the image..."
              className="w-full p-2 border border-gray-300 rounded resize-none h-20"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-1 transform ${
                  showAdvancedOptions ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="mb-4 space-y-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Width</label>
                    <select
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full p-1 border border-gray-300 rounded text-sm"
                      disabled={isLoading}
                    >
                      <option value={512}>512px</option>
                      <option value={768}>768px</option>
                      <option value={1024}>1024px</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Height</label>
                    <select
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full p-1 border border-gray-300 rounded text-sm"
                      disabled={isLoading}
                    >
                      <option value={512}>512px</option>
                      <option value={768}>768px</option>
                      <option value={1024}>1024px</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps: {numInferenceSteps}
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={numInferenceSteps}
                  onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guidance Scale: {guidanceScale}
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seed
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={seed !== null ? seed : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSeed(value === '' ? null : Number(value));
                    }}
                    placeholder="Random"
                    className="flex-1 p-1 border border-gray-300 rounded text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleRandomSeed}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Images: {numImages}
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2 mb-4">
            <AnimatedButton
              onClick={handleGenerateImages}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Generating...' : 'Generate Images'}
            </AnimatedButton>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <AnimatedButton
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="md"
              disabled={isLoading}
            >
              Upload
            </AnimatedButton>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative border-2 rounded overflow-hidden cursor-pointer ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                    onClick={() => handleImageSelect(index)}
                  >
                    <img
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>

              {selectedImageIndex !== null && (
                <div className="flex space-x-2 mb-4">
                  <AnimatedButton
                    onClick={handleGenerateVariations}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Create Variations
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={handleUpscaleImage}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Upscale
                  </AnimatedButton>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AnimatedPanel>
  );
};

export default AIImageGenerator;