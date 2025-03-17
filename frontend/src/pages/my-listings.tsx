import { Edit, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

// Mock data for user's listings
const MY_LISTINGS = [
  {
    id: 1,
    title: 'Modern Condo in Orchard',
    status: 'active',
    views: 245,
    inquiries: 12,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    price: 4500,
    location: 'Orchard Road',
  },
  {
    id: 2,
    title: 'Cozy Studio near MRT',
    status: 'pending',
    views: 124,
    inquiries: 5,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000',
    price: 2200,
    location: 'Tampines',
  },
];

export function MyListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link to="/create-listing">
          <Button>
            <Plus className="mr-2 h-5 w-5" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MY_LISTINGS.map((listing) => (
          <div
            key={listing.id}
            className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="h-48 w-full object-cover"
              />
              <div className="absolute right-2 top-2 flex space-x-2">
                <Link
                  to={`/edit-listing/${listing.id}`}
                  className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-blue-500"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-red-500">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute left-2 top-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    listing.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="mb-2 text-xl font-semibold">{listing.title}</h3>
              <p className="mb-4 text-gray-600">{listing.location}</p>
              <p className="mb-4 text-2xl font-bold text-blue-600">${listing.price}/month</p>

              <div className="flex justify-between border-t pt-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">{listing.views}</span> views
                </div>
                <div>
                  <span className="font-medium">{listing.inquiries}</span> inquiries
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}