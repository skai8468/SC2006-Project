import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '3/2' | '16/9';
}

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400x300?text=No+Image';

export function PropertyImage({ src, alt, className = '', aspectRatio = '3/2' }: PropertyImageProps) {
  const [error, setError] = useState(false);

  const aspectRatioClass = {
    'square': 'aspect-square',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-video',
  }[aspectRatio];

  if (error) {
    return (
      <div className={`${aspectRatioClass} flex items-center justify-center rounded-lg bg-gray-100 ${className}`}>
        <div className="text-center">
          <ImageOff className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${aspectRatioClass} overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          if (src !== FALLBACK_IMAGE_URL) {
            e.currentTarget.src = FALLBACK_IMAGE_URL;
          } else {
            setError(true);
          }
        }}
      />
    </div>
  );
}