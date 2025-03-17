import { Bath, Bed, Heart, Square } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyImage } from './property-image';

interface PropertyCardProps {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  image: string;
  isNew?: boolean;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  sqft,
  type,
  image,
  isNew,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toString();
  };

  return (
    <Link
      to={`/properties/${id}`}
      className="group relative block overflow-hidden rounded-xl bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:shadow-gray-900/10
        before:absolute before:inset-0 before:rounded-xl before:border before:border-transparent before:transition-colors
        hover:before:border-blue-500/20 dark:hover:before:border-blue-400/20
        after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300
        after:ring-2 after:ring-blue-500/20 hover:after:opacity-100 dark:after:ring-blue-400/20"
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 dark:bg-gray-900/90"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
          }`}
        />
      </button>

      {/* Property Type & Price Badge */}
      <div className="absolute left-0 top-3 z-10 flex items-center">
        {isNew && (
          <span className="ml-3 rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white shadow-md">
            New
          </span>
        )}
        <div className="ml-3 rounded-r-full bg-white/95 px-4 py-1.5 shadow-md backdrop-blur-sm dark:bg-gray-900/95">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              ${formatPrice(price)}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/mo</span>
          </div>
        </div>
      </div>

      {/* Property Image */}
      <div className="relative">
        <PropertyImage
          src={image}
          alt={title}
          aspectRatio="3/2"
          className="w-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {type}
          </span>
        </div>

        <h3 className="mb-1 text-lg font-medium text-gray-900 line-clamp-1 dark:text-white">{title}</h3>
        <p className="mb-3 text-sm text-gray-600 line-clamp-1 dark:text-gray-300">{location}</p>

        <div className="flex items-center divide-x divide-gray-200 border-t pt-3 text-sm text-gray-600 dark:divide-gray-700 dark:border-gray-700 dark:text-gray-300">
          <div className="flex items-center pr-3">
            <Bed className="mr-1.5 h-4 w-4" />
            <span>{bedrooms} {bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
          <div className="flex items-center px-3">
            <Bath className="mr-1.5 h-4 w-4" />
            <span>{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span>
          </div>
          <div className="flex items-center pl-3">
            <Square className="mr-1.5 h-4 w-4" />
            <span>{sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}