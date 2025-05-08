'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LazyLoad } from './LazyLoad';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  lazyThreshold?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  className = '',
  style = {},
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  lazyThreshold = 0.1,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [generatedBlurUrl, setGeneratedBlurUrl] = useState<string | undefined>(blurDataURL);

  // Generate blur data URL if not provided
  useEffect(() => {
    if (!blurDataURL && placeholder === 'blur' && src.startsWith('http')) {
      // Simple blur placeholder (1x1 pixel)
      setGeneratedBlurUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg==');
    }
  }, [blurDataURL, placeholder, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  const imageComponent = (
    <div
      className={`optimized-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        ...style,
      }}
    >
      {error ? (
        <div
          className="optimized-image-error"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px',
          }}
        >
          Failed to load image
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          placeholder={placeholder === 'blur' ? 'blur' : 'empty'}
          blurDataURL={generatedBlurUrl}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit,
            width: '100%',
            height: '100%',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}
    </div>
  );

  // If priority is true or lazy is false, don't use lazy loading
  if (priority || !lazy) {
    return imageComponent;
  }

  // Use lazy loading
  return (
    <LazyLoad
      height={height}
      width={width}
      threshold={lazyThreshold}
      className={className}
      style={style}
    >
      {imageComponent}
    </LazyLoad>
  );
};

export default OptimizedImage;