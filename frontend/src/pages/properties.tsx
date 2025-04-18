// import { PROPERTIES } from '@/data/properties';
import { Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FilterModal, FilterValues } from '../components/filter/filter-modal';
import { MapProperty, PropertyMap } from '../components/map/property-map';
import { Button } from '../components/ui/button';
import { PropertyCard } from '../components/ui/property-card';

export function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty>();
  const [showMap, setShowMap] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    propertyTypes: [],
    priceRange: [0, 100000000],
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    placeType: [],
  });

  // Fetch properties from Django backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/property/all/');
        const data = await res.json();

        if (res.ok) {
          // console.log('Fetched properties:', data);
          setProperties(data);
        } else {
          console.error('Failed to fetch properties:', data);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters to properties
  const filteredProperties = properties.filter((property) => {
    // console.log(`Checking property ${property.id}:`, property);
    // Search query
    if (
      searchQuery &&
      !(
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }

    // Property type
    if (
      activeFilters.propertyTypes.length > 0 &&
      !activeFilters.propertyTypes.includes(property.type)
    ) {
      return false;
    }

    // Price range
    if (
      property.price < activeFilters.priceRange[0] ||
      property.price > activeFilters.priceRange[1]
    ) {
      return false;
    }

    // Bedrooms
    if (activeFilters.bedrooms > 0 && property.bedrooms < activeFilters.bedrooms) {
      return false;
    }

    // Bathrooms
    if (activeFilters.bathrooms > 0 && property.bathrooms < activeFilters.bathrooms) {
      return false;
    }

    // Amenities
    if (
      activeFilters.amenities.length > 0 &&
      !activeFilters.amenities.every((amenity) => property.amenities.includes(amenity))
    ) {
      return false;
    }

    return true;
  });

  const mapProperties: MapProperty[] = filteredProperties.map((property) => ({
    id: property.id,
    title: property.title,
    price: property.price,
    location: property.location,
    coordinates: [parseFloat(property.latitude), parseFloat(property.longitude)],
    image: property.images[0],
  }));

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
                className="h-12 w-full rounded-lg border pl-10 pr-4 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center shadow-sm hover:border-gray-300 hover:bg-gray-50"
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="shadow-sm hover:border-gray-300 hover:bg-gray-50"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={`grid gap-6 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                isNew={property.id % 5 === 0} // Example: Mark every 5th property as new
              />
            ))}
          </div>
        </div>
      </div>

      {showMap && (
        <div className="w-1/2 overflow-hidden rounded-lg border shadow-sm">
          <PropertyMap
            properties={mapProperties}
            selectedProperty={selectedProperty}
            onPropertySelect={(property) => setSelectedProperty(property)}
          />
        </div>
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setShowFilterModal(false);
        }}
        propertyCount={filteredProperties.length}
      />
    </div>
  );
}