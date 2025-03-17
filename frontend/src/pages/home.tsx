import { PROPERTIES } from '@/data/properties';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

// Select featured properties (3 highest-priced properties)
const FEATURED_PROPERTIES = PROPERTIES
  .sort((a, b) => b.price - a.price)
  .slice(0, 3);

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=2070)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent backdrop-blur-[2px] dark:from-black/80 dark:via-black/60 dark:to-black/20" />
        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
              Find Your Dream Rental Today!
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-200">
              Discover the perfect property that matches your lifestyle and budget.
            </p>
            <Link to="/properties">
              <Button size="lg" className="group font-semibold">
                Start Your Search
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Featured Properties
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Explore our handpicked selection of premium properties, chosen for their exceptional
              quality, prime locations, and outstanding amenities.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROPERTIES.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800/50"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 transition-opacity group-hover:opacity-70 dark:from-black/90 dark:via-black/50 dark:to-transparent" />
                </div>

                {/* Property Badge */}
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-blue-600/90 px-3 py-1 text-sm font-medium text-white shadow-lg backdrop-blur-sm dark:bg-blue-500/90">
                    {property.type}
                  </span>
                </div>

                {/* Property Price */}
                <div className="absolute right-4 top-4">
                  <div className="rounded-lg bg-white/90 px-3 py-1.5 text-lg font-bold text-gray-900 shadow-lg backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                    ${property.price.toLocaleString()}/mo
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {property.title}
                  </h3>
                  <div className="mb-4 flex items-center text-gray-200">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/20 pt-4">
                    <div className="flex space-x-4 text-sm text-gray-200">
                      <div>{property.bedrooms} beds</div>
                      <div>{property.bathrooms} baths</div>
                      <div>{property.sqft} sqft</div>
                    </div>
                    <div className="flex items-center text-white">
                      <span className="mr-1 text-sm font-medium">View Details</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/properties">
              <Button variant="outline" size="lg" className="group">
                View All Properties
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}