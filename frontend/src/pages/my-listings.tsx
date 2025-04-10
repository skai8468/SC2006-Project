import { Edit, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  image: string;
  price: number;
  location: string;
}

export function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { user } = useAuth();

  // console.log('User:', user); // Check if user is being fetched correctly
  useEffect(() => {
    const fetchListings = async () => {
        try {
            // console.log(user.id);
            const apiUrl = `http://localhost:8000/property/all/?owner=${user?.id}`;
            const response = await axios.get(apiUrl, {
                withCredentials: true,
            });
            // for (const listing of response.data) {
            //   if (listing.owner == user.id) {
            //     console.log('Listing:', listing.owner);
            //   }
            // }

            const filteredListings = user?.id ? response.data.filter((listing: Listing) => listing.owner === user.id) : [];
            setListings(filteredListings);

            // setListings(filteredListings);
            // setListings(response.data);
            // console.log('Fetched listings:', response.data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };
      fetchListings();
  }, [user]);
  

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
        {listings.map((listing) => (
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