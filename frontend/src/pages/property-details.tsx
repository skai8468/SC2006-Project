import { PROPERTIES } from '@/data/properties';
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
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { PropertyImage } from '../components/ui/property-image';

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Find the property based on the ID from the URL
  const property = PROPERTIES.find((p) => p.id === Number(id));

  // If property not found, show error state
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border bg-white p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Property Not Found</h1>
          <p className="mb-6 text-gray-600">
            Sorry, we couldn't find the property you're looking for.
          </p>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  // Generate multiple images using the same image for demo purposes
  const propertyImages = [property.image, property.image, property.image];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-8 overflow-hidden rounded-lg">
            <PropertyImage
              src={propertyImages[selectedImage]}
              alt={property.title}
              aspectRatio="16/9"
              className="h-[400px]"
            />
            <div className="mt-4 flex gap-4">
              {propertyImages.map((image, index) => (
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
              {property.location}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-400" />
                <span>{property.type}</span>
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
                <span>{property.sqft} sqft</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Description</h2>
              <p className="text-gray-600">{property.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
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
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
                ></textarea>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}

            <div className="mt-6 border-t pt-6">
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
                  alt="Agent"
                  className="mr-4 h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Jane Smith</p>
                  <p className="text-sm text-gray-500">(555) 123-4567</p>
                  <p className="text-sm text-gray-500">jane.smith@rentease.com</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Available Now
              </div>
              <div>Property ID: {property.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}