import { Edit, Plus, Trash2, Check, X } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedListing, setEditedListing] = useState<Partial<Listing>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // console.log('User:', user); // Check if user is being fetched correctly
  useEffect(() => {
    const fetchListings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
          // console.log(user.id);
          setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

      fetchListings();
  }, [user?.id]);
  
  const handleEditClick = (listing: Listing) => {
    setEditingId(listing.id);
    setEditedListing({
      title: listing.title,
      price: listing.price,
      location: listing.location,
      status: listing.status
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedListing({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedListing(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSaveEdit = async (id: number) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      await axios.put(
        `http://localhost:8000/property/details/${id}/`,
        editedListing,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setListings(listings.map(listing => 
        listing.id === id ? { ...listing, ...editedListing } : listing
      ));
      
      setEditingId(null);
      setEditedListing({});
    } catch (error) {
      console.error('Error updating listing:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:8000/property/details/${id}/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        setListings(listings.filter(listing => listing.id !== id));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Server responded with:', error.response.status);
            console.error('Response data:', error.response.data);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error setting up request:', error.message);
          }
        } else {
          console.error('Unexpected error:', error);
        }
      }
    }
  };


  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="flex justify-center items-center h-64">
  //         <p>Loading your listings...</p>
  //       </div>
  //     </div>
  //   );
  // }


  // if (!user) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="rounded-lg border bg-white p-8 text-center">
  //         <h1 className="mb-4 text-2xl font-bold">Please log in</h1>
  //         <p className="mb-6 text-gray-600">You need to be logged in to view your listings</p>
  //         <Link to="/login">
  //           <Button>Login</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  
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
                {editingId === listing.id ? (
                    <>
                      <button 
                        onClick={() => handleSaveEdit(listing.id)}
                        className="rounded-full bg-white p-2 text-green-600 shadow-sm hover:bg-green-50"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="rounded-full bg-white p-2 text-red-600 shadow-sm hover:bg-red-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(listing)}
                        className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-blue-500"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                {/* <Link
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
              </div> */}
            </div>
            <div className="absolute left-2 top-2">
                {editingId === listing.id ? (
                  <select
                    name="status"
                    value={editedListing.status || ''}
                    onChange={handleInputChange}
                    className="rounded-full bg-white px-3 py-1 text-sm font-medium shadow-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="rented">Rented</option>
                  </select>
                ) : (
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
                )}
              </div>
            </div>
            <div className="p-4">
              {/* <h3 className="mb-2 text-xl font-semibold">{listing.title}</h3>
              <p className="mb-4 text-gray-600">{listing.location}</p>
              <p className="mb-4 text-2xl font-bold text-blue-600">${listing.price}/month</p>

              <div className="flex justify-between border-t pt-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">{listing.views}</span> views
                </div>
                <div>
                  <span className="font-medium">{listing.inquiries}</span> inquiries
                </div>
              </div> */}
              {editingId === listing.id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editedListing.title || ''}
                    onChange={handleInputChange}
                    className="mb-2 w-full rounded border p-2 text-xl font-semibold"
                  />
                  <input
                    type="text"
                    name="location"
                    value={editedListing.location || ''}
                    onChange={handleInputChange}
                    className="mb-4 w-full rounded border p-2 text-gray-600"
                  />
                  <input
                    type="number"
                    name="price"
                    value={editedListing.price || ''}
                    onChange={handleInputChange}
                    className="mb-4 w-full rounded border p-2 text-2xl font-bold text-blue-600"
                  />
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-xl font-semibold">{listing.title}</h3>
                  <p className="mb-4 text-gray-600">{listing.location}</p>
                  <p className="mb-4 text-2xl font-bold text-blue-600">${listing.price}/month</p>
                </>
              )}

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