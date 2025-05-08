import React from 'react';
import { render, screen } from '@testing-library/react';
import { LazyLoad } from '../ui/LazyLoad';

describe('LazyLoad', () => {
  it('renders placeholder when not visible', () => {
    render(
      <LazyLoad>
        <div data-testid="content">Content</div>
      </LazyLoad>
    );

    // Content should not be visible initially
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    
    // Placeholder should be visible
    expect(screen.getByClassName('lazy-load-placeholder')).toBeInTheDocument();
  });

  it('renders children when visible', () => {
    // Mock IntersectionObserver to trigger visibility
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => {
        // Immediately call the callback with isIntersecting = true
        mockIntersectionObserver.mock.calls[0][0]([{ isIntersecting: true }]);
      },
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;

    render(
      <LazyLoad>
        <div data-testid="content">Content</div>
      </LazyLoad>
    );

    // Content should be visible after intersection
    setTimeout(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    }, 200);
  });

  it('calls onVisible callback when visible', () => {
    // Mock IntersectionObserver to trigger visibility
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => {
        // Immediately call the callback with isIntersecting = true
        mockIntersectionObserver.mock.calls[0][0]([{ isIntersecting: true }]);
      },
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;

    const onVisible = jest.fn();

    render(
      <LazyLoad onVisible={onVisible}>
        <div>Content</div>
      </LazyLoad>
    );

    // onVisible should be called
    expect(onVisible).toHaveBeenCalled();
  });
});