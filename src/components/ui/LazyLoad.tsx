'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  height?: number | string;
  width?: number | string;
  threshold?: number;
  placeholder?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onVisible?: () => void;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 'auto',
  width = '100%',
  threshold = 0.1,
  placeholder,
  className = '',
  style = {},
  onVisible,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (onVisible) onVisible();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '100px',
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, onVisible]);

  // Set hasLoaded after a short delay once visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`lazy-load-container ${className}`}
      style={{
        height,
        width,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {isVisible ? (
        <div
          className={`lazy-load-content ${hasLoaded ? 'loaded' : 'loading'}`}
          style={{
            opacity: hasLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          {children}
        </div>
      ) : (
        <div className="lazy-load-placeholder">
          {placeholder || (
            <div
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="animate-pulse bg-gray-200 h-full w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoad;