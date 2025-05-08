'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Use useEffect to access window object only on the client side
  useEffect(() => {
    // Create a direct URL to the draw page - only runs in browser
    const drawUrl = window.location.origin + "/draw";
    console.log("Direct URL to draw page:", drawUrl);
  }, []);

  const handleDrawClick = () => {
    console.log("Draw button clicked, attempting to navigate to /draw");
    // Try programmatic navigation as an alternative
    router.push('/draw');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Drawing Masters App</h1>
        <p className="text-gray-600 mb-8 text-center">
          A professional art drawing application for creating stunning digital artwork.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/draw"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Drawing (Link with /draw)
          </Link>

          <Link
            href="draw"
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            Start Drawing (Link with draw)
          </Link>

          {/* Add a regular button with onClick handler */}
          <button
            onClick={handleDrawClick}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Start Drawing (Button with navigate)
          </button>

          {/* Add a regular anchor tag as a fallback */}
          <a
            href="/draw"
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Start Drawing (Regular anchor tag)
          </a>
        </div>
      </div>
    </main>
  );
}
