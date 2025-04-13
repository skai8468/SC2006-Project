export interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  coordinates: [number, number];
  description: string;
  amenities: string[];
  image: string;
}

export interface MapProperty {
  id: number;
  title: string;
  price: number;
  location: string;
  coordinates: [number, number];
  image: string;
}