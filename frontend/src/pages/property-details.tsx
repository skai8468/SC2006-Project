import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Square,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { PropertyImage } from '../components/ui/property-image';
import axios from 'axios';

interface Property {
  id: number;
  title: string;
  block: string;
  description: string;
  town: string;
  city: string;
  price: string;
  street_name: string;
  location: string; 
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  amenities: string;
  images?: string[];
  status: string;
  created_at: string;
  updated_at: string;
  owner: number;
  latitude: string;
  longitude: string;
  zip_code: string;
}

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/property/details/${id}/`
        );
        
        const propertyData = response.data;
        setProperty(propertyData);
        console.log('Fetched property:', response.data);
        setImages(propertyData.images || []);

        if (typeof propertyData.amenities === 'string') {
          setAmenities(propertyData.amenities.split(',').map((a: string) => a.trim()));
        } else if (Array.isArray(propertyData.amenities)) {
          setAmenities(propertyData.amenities);
        } else {
          setAmenities([]);
        }
      } catch (err) {
        setError('Failed to fetch property details');
        console.error('Error fetching property:', err);

      } finally {
        setLoading(false);
      }
    };
  
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border bg-white p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Property Not Found</h1>
          <p className="mb-6 text-gray-600">
            {error || 'Sorry, we couldn\'t find the property you\'re looking for.'}
          </p>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-8 overflow-hidden rounded-lg">
            {images.length > 0 ? (
              <>
                <PropertyImage
                  src={images[selectedImage]}
                  alt={property.title}
                  aspectRatio="16/9"
                  className="h-[400px]"
                />
                <div className="mt-4 flex gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-lg ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <PropertyImage
                        src={image}
                        alt={`View ${index + 1}`}
                        aspectRatio="square"
                        className="h-20 w-20"
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[400px] items-center justify-center bg-gray-100">
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={isFavorite ? 'text-red-500' : ''}
                >
                  <Heart className="mr-2 h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            <div className="mb-6 flex items-center text-gray-500">
              <MapPin className="mr-2 h-5 w-5" />
              {property.location || `${property.block} ${property.street_name}, ${property.town}, ${property.city}`}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-400" />
                <span>{property.property_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-400" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-400" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-gray-400" />
                <span>{property.square_feet} sqft</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Description</h2>
              <p className="text-gray-600">{property.description}</p>
            </div>

            {amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold">Amenities</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <p className="text-3xl font-bold text-blue-600">${property.price}</p>
              <p className="text-gray-500">per month</p>
            </div>

            <div className="mb-6 space-y-4">
              <Button className="w-full">
                <Phone className="mr-2 h-5 w-5" />
                Call Agent
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowContactForm(!showContactForm)}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Message Agent
              </Button>
            </div>

            {showContactForm && (
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  required
                ></textarea>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between border-t pt-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {property.status === 'available' ? 'Available Now' : property.status}
              </div>
              <div>Property ID: {property.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}