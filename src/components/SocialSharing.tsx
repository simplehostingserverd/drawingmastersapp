'use client';

import React, { useState } from 'react';
import { AnimatedButton, AnimatedPanel, AnimatedTooltip } from './ui/AnimatedComponents';
import OptimizedImage from './ui/OptimizedImage';

interface SocialSharingProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  isOpen,
  onClose,
  canvasRef,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'embed' | 'download'>('share');

  // Generate image from canvas
  const generateImage = () => {
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }
    
    try {
      // Get image data URL
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setImageUrl(dataUrl);
      setError(null);
    } catch (err) {
      setError('Failed to generate image');
      console.error('Error generating image:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!imageUrl) {
      setError('Please generate an image first');
      return;
    }
    
    if (!title) {
      setError('Please enter a title');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Upload to server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drawings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: title,
          imageData: imageUrl,
          metadata: {
            description,
            tags: tags.split(',').map(tag => tag.trim()),
            isPublic,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to share drawing');
      }
      
      // Set share URL
      setShareUrl(`${window.location.origin}/drawings/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share drawing');
      console.error('Error sharing drawing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Error copying to clipboard:', err);
      });
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'pinterest' | 'reddit') => {
    if (!shareUrl) return;
    
    let url = '';
    const text = encodeURIComponent(`Check out my drawing: ${title}`);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl || '')}&description=${text}`;
        break;
      case 'reddit':
        url = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${text}`;
        break;
    }
    
    window.open(url, '_blank');
  };

  // Generate embed code
  const generateEmbedCode = () => {
    if (!shareUrl) return '';
    
    return `<iframe src="${shareUrl}/embed" width="600" height="400" frameborder="0" allowfullscreen></iframe>`;
  };

  // Download image
  const downloadImage = (format: 'png' | 'jpeg' | 'svg') => {
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }
    
    try {
      // Get image data URL
      const dataUrl = canvasRef.current.toDataURL(`image/${format}`);
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${title || 'drawing'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(`Failed to download as ${format.toUpperCase()}`);
      console.error('Error downloading image:', err);
    }
  };

  // Effect to generate image when panel opens
  React.useEffect(() => {
    if (isOpen && !imageUrl) {
      generateImage();
    }
  }, [isOpen]);

  return (
    <AnimatedPanel
      isOpen={isOpen}
      onClose={onClose}
      direction="right"
      className="w-96 h-full p-4 flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Share Your Drawing</h2>
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

      {/* Image preview */}
      <div className="mb-4 bg-gray-100 rounded-md overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Drawing preview"
            className="w-full h-auto"
          />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <button
              onClick={generateImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Generate Preview
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'share'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          } rounded-l-md`}
          onClick={() => setActiveTab('share')}
        >
          Share
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'embed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('embed')}
        >
          Embed
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'download'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          } rounded-r-md`}
          onClick={() => setActiveTab('download')}
        >
          Download
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'share' && (
          <div className="space-y-4">
            {!shareUrl ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your drawing"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your drawing"
                    className="w-full p-2 border border-gray-300 rounded h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="art, drawing, sketch"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make this drawing public
                  </label>
                </div>
                <AnimatedButton
                  onClick={handleShare}
                  variant="primary"
                  className="w-full"
                  disabled={!imageUrl || !title || isLoading}
                >
                  {isLoading ? 'Sharing...' : 'Share Drawing'}
                </AnimatedButton>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Share URL
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l"
                    />
                    <button
                      onClick={copyShareUrl}
                      className="px-3 bg-blue-600 text-white rounded-r"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Share to Social Media
                  </div>
                  <div className="flex space-x-2">
                    <AnimatedTooltip content="Share to Twitter">
                      <button
                        onClick={() => shareToSocial('twitter')}
                        className="p-2 bg-[#1DA1F2] text-white rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </button>
                    </AnimatedTooltip>
                    <AnimatedTooltip content="Share to Facebook">
                      <button
                        onClick={() => shareToSocial('facebook')}
                        className="p-2 bg-[#1877F2] text-white rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                    </AnimatedTooltip>
                    <AnimatedTooltip content="Share to Pinterest">
                      <button
                        onClick={() => shareToSocial('pinterest')}
                        className="p-2 bg-[#E60023] text-white rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                        </svg>
                      </button>
                    </AnimatedTooltip>
                    <AnimatedTooltip content="Share to Reddit">
                      <button
                        onClick={() => shareToSocial('reddit')}
                        className="p-2 bg-[#FF4500] text-white rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                        </svg>
                      </button>
                    </AnimatedTooltip>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-4">
            {!shareUrl ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  You need to share your drawing first to get an embed code.
                </p>
                <AnimatedButton
                  onClick={() => setActiveTab('share')}
                  variant="primary"
                >
                  Go to Share
                </AnimatedButton>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Embed Code
                  </label>
                  <textarea
                    value={generateEmbedCode()}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded h-24 font-mono text-sm"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border border-gray-300 rounded p-2 bg-gray-50">
                    <div className="aspect-video relative">
                      <iframe
                        src={`${shareUrl}/embed`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'download' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Download Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <AnimatedButton
                  onClick={() => downloadImage('png')}
                  variant="outline"
                  size="sm"
                >
                  PNG
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => downloadImage('jpeg')}
                  variant="outline"
                  size="sm"
                >
                  JPEG
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => downloadImage('svg')}
                  variant="outline"
                  size="sm"
                >
                  SVG
                </AnimatedButton>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Format Information
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <strong>PNG:</strong> Best for illustrations with transparency
                </li>
                <li>
                  <strong>JPEG:</strong> Smaller file size, good for photos
                </li>
                <li>
                  <strong>SVG:</strong> Vector format, scalable to any size
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AnimatedPanel>
  );
};

export default SocialSharing;