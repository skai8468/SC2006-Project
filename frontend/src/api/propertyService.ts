import axios from 'axios';
import { Property } from '@/types/property';
import { geocodeSingaporeAddress } from '../components/utility/geocode.ts';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/app';
const DEFAULT_COORDS: [number, number] = [1.3521, 103.8198]; // Singapore coordinates
interface FetchPropertiesParams {
  search?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  types?: string;
  amenities?: string;
  requireCoordinates?: boolean;
}

// export const fetchProperties = async (params: any = {}) => {
//   console.log('Making request to:', `${API_BASE_URL}/properties/`);
//   console.log('With params:', params);
  
//   try {
//     const response = await axios.get(`${API_BASE_URL}/properties/`, { params });
//     console.log('Full API response:', response);
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

export const fetchPropertiesWithGeocode = async (params: FetchPropertiesParams = {}) => {
  try {
    // Destructure the params to separate the requireCoordinates flag
    const { requireCoordinates = false, ...apiParams } = params;
    
    const response = await axios.get(`${API_BASE_URL}/properties/`, { 
      params: apiParams  // Pass all other params to the API
    });
    const properties = response.data;

    // Only geocode if explicitly requested
    if (requireCoordinates) {
      const propertiesWithCoords = await Promise.all(
        properties.map(async (property: Property) => {
          try {
            const fullAddress = `${property.address}, ${property.zip_code}, Singapore`;
            const coordinates = await geocodeSingaporeAddress(fullAddress);
            return { ...property, coordinates };
          } catch (error) {
            console.error(`Geocoding failed for property ${property.id}`, error);
            return { ...property, coordinates: DEFAULT_COORDS };
          }
        })
      );
      return propertiesWithCoords;
    }

    return properties;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};