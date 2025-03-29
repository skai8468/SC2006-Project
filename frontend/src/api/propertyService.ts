import axios from 'axios';
import { Property } from '@/types/property';
import { geocodeSingaporeAddress } from '../components/utility/geocode.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/app';

interface FetchPropertiesParams {
  search?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  types?: string;
  amenities?: string;
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

export const fetchPropertiesWithGeocode = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/properties/`);
    const properties = response.data;

    const propertiesWithCoords = await Promise.all(
      properties.map(async (property: Property) => {
        try {
          const fullAddress = `${property.address}, ${property.zip_code}, Singapore`;
          const coordinates = await geocodeSingaporeAddress(fullAddress);
          
          return {
            ...property,
            coordinates
          };
        } catch (error) {
          console.error(`Failed to geocode property ${property.id}:`, error);
          return {
            ...property,
            coordinates: [1.3521, 103.8198] // Default Singapore coordinates
          };
        }
      })
    );

    return propertiesWithCoords;
   } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};