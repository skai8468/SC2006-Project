import { Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FilterModal, FilterValues } from '../components/filter/filter-modal';
import { MapProperty, PropertyMap } from '../components/map/property-map';
import { Button } from '../components/ui/button';
import { PropertyCard } from '../components/ui/property-card';
import { fetchPropertiesWithGeocode } from '@/api/propertyService';
import { Property } from '@/types/property';
import { useDebounce } from '../hooks/useDebounce';


export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<MapProperty>();
  const [showMap, setShowMap] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    propertyTypes: [],
    priceRange: [0, 10000],
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    placeType: [],
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching all properties...');

        const data = await fetchPropertiesWithGeocode();
        console.log('Received properties data:', data);
        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
        console.error(err);
      } finally {
        setLoading(false);
        console.log('Loading complete');
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchPropertiesWithGeocode({
          search: debouncedSearchQuery,
          min_price: activeFilters.priceRange[0],
          max_price: activeFilters.priceRange[1],
          bedrooms: activeFilters.bedrooms,
          bathrooms: activeFilters.bathrooms,
          types: activeFilters.propertyTypes.join(','),
          amenities: activeFilters.amenities.join(','),
          requireCoordinates: showMap,
        });
        setProperties(data);
      } catch (err) {
        setError('Failed to load properties');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    loadProperties();
  }, [debouncedSearchQuery, activeFilters]);
  
  console.log('Rendering with:', {
    properties,
    loading,
    error,
    showMap,
    searchQuery,
    activeFilters
  });

  const mapProperties: MapProperty[] = properties.map((property) => ({
    id: property.id,
    title: property.address,
    price: property.price,
    location: `${property.city}, ${property.state}`,
    coordinates: property.coordinates || [0, 0],
    image: property.image || '/placeholder.jpg'
  }));

  if (error) {
    console.log('Error state rendered:', error);
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${showMap ? 'w-1/2' : 'w-full'}`}>
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className={`h-12 w-full rounded-lg border pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilterModal(true)}
              disabled={loading}
              className={`flex items-center shadow-sm hover:border-gray-300 hover:bg-gray-50 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              disabled={loading}
              className={`shadow-sm hover:border-gray-300 hover:bg-gray-50 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className={`grid gap-6 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  isNew={property.created_at ? 
                    new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : 
                    false
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showMap && (
        <div className="w-1/2 overflow-hidden rounded-lg border shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <PropertyMap
              properties={mapProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={(property) => setSelectedProperty(property)}
            />
          )}
        </div>
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setShowFilterModal(false);
        }}
        propertyCount={properties.length}
      />
    </div>
  );
}