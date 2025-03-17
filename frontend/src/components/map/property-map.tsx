import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import { PropertyImage } from '../ui/property-image';

// Define the property type
export interface MapProperty {
  id: number;
  title: string;
  price: number;
  location: string;
  coordinates: [number, number];
  image: string;
  type?: string;
}

interface PropertyMapProps {
  properties: MapProperty[];
  selectedProperty?: MapProperty;
  onPropertySelect?: (property: MapProperty) => void;
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'property-marker',
});

export function PropertyMap({ properties, selectedProperty, onPropertySelect }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [validProperties, setValidProperties] = useState<MapProperty[]>([]);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);

  // Center map on Singapore by default
  const defaultCenter: [number, number] = [1.3521, 103.8198];
  const defaultZoom = 12;

  // Validate coordinates and filter properties
  useEffect(() => {
    const validProps = properties.filter(property => {
      const [lat, lng] = property.coordinates;
      const isValid = 
        typeof lat === 'number' && 
        typeof lng === 'number' &&
        !isNaN(lat) && 
        !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;

      if (!isValid) {
        console.warn(`Invalid coordinates for property ${property.id}:`, property.coordinates);
      }
      return isValid;
    });

    setValidProperties(validProps);
  }, [properties]);

  // Update map bounds when valid properties change
  useEffect(() => {
    if (mapRef.current && validProperties.length > 0) {
      try {
        const bounds = new L.LatLngBounds(validProperties.map(property => property.coordinates));
        const paddingOffset = 0.1;
        const paddedBounds = bounds.pad(paddingOffset);
        mapRef.current.fitBounds(paddedBounds);
      } catch (error) {
        console.error('Error updating map bounds:', error);
      }
    }
  }, [validProperties]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      scrollWheelZoom={true}
      zoomControl={false}
      doubleClickZoom={true}
      dragging={true}
      touchZoom={true}
      attributionControl={true}
      zoomSnap={0.5}
      zoomDelta={0.5}
      minZoom={11}
      maxZoom={18}
      className="map-container"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={property.coordinates}
          icon={customIcon}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              if (onPropertySelect) {
                onPropertySelect(property);
              }
            },
            mouseover: () => {
              setHoveredMarkerId(property.id);
            },
            mouseout: () => {
              setHoveredMarkerId(null);
            }
          }}
          zIndexOffset={hoveredMarkerId === property.id ? 1000 : 0}
        >
          <Popup closeButton={true} className="property-popup">
            <div 
              className="w-64 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <PropertyImage
                  src={property.image}
                  alt={property.title}
                  aspectRatio="3/2"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-sm font-bold text-gray-900 shadow-md backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                  ${property.price.toLocaleString()}/mo
                </div>
              </div>
              <div className="p-3">
                <h3 className="mb-1 text-lg font-semibold text-gray-900 line-clamp-1 dark:text-white">
                  {property.title}
                </h3>
                <p className="mb-2 text-sm text-gray-600 line-clamp-1 dark:text-gray-400">
                  {property.location}
                </p>
                <button
                  onClick={() => onPropertySelect?.(property)}
                  className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}