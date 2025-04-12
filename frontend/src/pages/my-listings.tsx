import { Edit, Plus, Trash2, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createContext, useContext } from 'react';
import { useAuth } from '../components/auth/auth-context';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

interface Listing {
  id: number;
  owner: number;
  title: string;
  status: string;
  views: number;
  inquiries: number;
  price: number;
  location: string;
  images: string[];
}

export function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  // const [editingId, setEditingId] = useState<number | null>(null);
  // const [editedListing, setEditedListing] = useState<Partial<Listing>>({});
  // const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate(); 


  // console.log('User:', user); // Check if user is being fetched correctly
  useEffect(() => {
    const fetchListings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:8000/property/all/?owner=${user?.id}`,
            {
              headers : {
                'Authorization': `Token ${localStorage.getItem('authToken')}`,
              }
          });

          const filteredListings = response.data.filter(
            (listing: Listing) => listing.owner === user.id
          );

          // console.log('Fetched Listings:', filteredListings);
          setListings(filteredListings);
          
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };
      // console.log('image:', listings[0]?.image);
      fetchListings();
  }, [user?.id]);
  
  const handleListingClick = (e: React.MouseEvent, propertyId: number) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('button') && 
      !target.closest('a') && 
      !target.closest('input') &&
      !target.closest('select')
    ) {
      navigate(`/properties/${propertyId}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border bg-white p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Please log in</h1>
          <p className="mb-6 text-gray-600">You need to be logged in to view your listings</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }
  
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

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">You haven't created any listings yet</p>
            <Link to="/create-listing" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
              onClick={(e) => handleListingClick(e, listing.id)}
            >
              <div className="relative">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="h-48 w-full object-contain"
                />
                <div className="absolute left-2 top-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : listing.status === 'rented'
                        ? 'bg-blue-100 text-blue-800'
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
          ))
        )}
      </div>
    </div>
  );
}