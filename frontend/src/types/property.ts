export interface Property {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  type: string;
  coordinates: [number, number];
  description: string;
  amenities: string[];
  image: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at?: Date | string;
}

export interface MapProperty {
  id: number;
  title: string;
  price: number;
  location: string;
  coordinates: [number, number];
  image: string;
}