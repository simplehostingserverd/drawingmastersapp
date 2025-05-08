'use client';

// Define image generation parameters
export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
  numImages?: number;
}

// Define image generation result
export interface ImageGenerationResult {
  images: string[];
  seed: number;
  prompt: string;
  negativePrompt?: string;
}

// Stable Diffusion API client
class StableDiffusionClient {
  private apiKey: string | null = null;
  private apiEndpoint: string = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

  constructor() {
    // Initialize with environment variable if available
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_STABILITY_API_KEY) {
      this.apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
    }
  }

  // Set API key
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // Get API key
  getApiKey(): string | null {
    return this.apiKey;
  }

  // Set API endpoint
  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
  }

  // Check if client is initialized
  isInitialized(): boolean {
    return this.apiKey !== null;
  }

  // Generate images from text prompt
  async generateImages({
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    numInferenceSteps = 30,
    guidanceScale = 7.5,
    seed = Math.floor(Math.random() * 4294967295),
    numImages = 1,
  }: ImageGenerationParams): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      throw new Error('Stability API key is required');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1.0,
            },
            {
              text: negativePrompt,
              weight: -1.0,
            },
          ],
          cfg_scale: guidanceScale,
          height,
          width,
          samples: numImages,
          steps: numInferenceSteps,
          seed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stability API error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract base64 images from response
      const images = data.artifacts.map((artifact: any) => {
        return `data:image/png;base64,${artifact.base64}`;
      });

      return {
        images,
        seed,
        prompt,
        negativePrompt,
      };
    } catch (error) {
      console.error('Error generating images:', error);
      throw error;
    }
  }

  // Generate image variations
  async generateVariations(
    imageBase64: string,
    {
      prompt = '',
      numInferenceSteps = 30,
      guidanceScale = 7.5,
      seed = Math.floor(Math.random() * 4294967295),
      numImages = 1,
    }: Partial<ImageGenerationParams> = {}
  ): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      throw new Error('Stability API key is required');
    }

    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: (() => {
          const formData = new FormData();
          
          // Convert base64 to blob
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          for (let i = 0; i < byteCharacters.length; i += 512) {
            const slice = byteCharacters.slice(i, i + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: 'image/png' });
          
          formData.append('init_image', blob);
          formData.append('init_image_mode', 'IMAGE_STRENGTH');
          formData.append('image_strength', '0.35');
          formData.append('text_prompts[0][text]', prompt);
          formData.append('text_prompts[0][weight]', '1');
          formData.append('cfg_scale', guidanceScale.toString());
          formData.append('samples', numImages.toString());
          formData.append('steps', numInferenceSteps.toString());
          formData.append('seed', seed.toString());
          
          return formData;
        })(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stability API error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract base64 images from response
      const images = data.artifacts.map((artifact: any) => {
        return `data:image/png;base64,${artifact.base64}`;
      });

      return {
        images,
        seed,
        prompt,
      };
    } catch (error) {
      console.error('Error generating image variations:', error);
      throw error;
    }
  }

  // Upscale an image
  async upscaleImage(imageBase64: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Stability API key is required');
    }

    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await fetch('https://api.stability.ai/v1/generation/esrgan-v1/image-to-image/upscale', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: (() => {
          const formData = new FormData();
          
          // Convert base64 to blob
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          for (let i = 0; i < byteCharacters.length; i += 512) {
            const slice = byteCharacters.slice(i, i + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: 'image/png' });
          
          formData.append('image', blob);
          formData.append('width', '2048');
          
          return formData;
        })(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stability API error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Return the upscaled image
      return `data:image/png;base64,${data.artifacts[0].base64}`;
    } catch (error) {
      console.error('Error upscaling image:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const stableDiffusionClient = new StableDiffusionClient();

export default stableDiffusionClient;