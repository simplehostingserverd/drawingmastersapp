import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptimizedImage } from '../ui/OptimizedImage';

describe('OptimizedImage', () => {
  it('renders the image with correct props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        priority={true}
        lazy={false}
      />
    );

    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
    expect(image).toHaveAttribute('width', '200');
    expect(image).toHaveAttribute('height', '150');
  });

  it('renders with LazyLoad when lazy=true', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        lazy={true}
      />
    );

    // LazyLoad container should be present
    expect(screen.getByClassName('lazy-load-container')).toBeInTheDocument();
  });

  it('does not use LazyLoad when priority=true', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        priority={true}
        lazy={true}
      />
    );

    // LazyLoad container should not be present when priority is true
    expect(screen.queryByClassName('lazy-load-container')).not.toBeInTheDocument();
  });

  it('shows error state when image fails to load', () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        lazy={false}
      />
    );

    const image = screen.getByAltText('Test Image');
    
    // Simulate error
    fireEvent.error(image);
    
    // Error message should be displayed
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('calls onLoad callback when image loads', () => {
    const onLoad = jest.fn();
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={200}
        height={150}
        lazy={false}
        onLoad={onLoad}
      />
    );

    const image = screen.getByAltText('Test Image');
    
    // Simulate load
    fireEvent.load(image);
    
    // onLoad should be called
    expect(onLoad).toHaveBeenCalled();
  });
});