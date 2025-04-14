import { Edit, Plus, Trash2, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components/auth/auth-context";
// import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt'; // Unused import

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // New state for favorites
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // New state for property requests
  const [requests, setRequests] = useState<Listing[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Fetch created listings
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
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const filteredListings = response.data.filter(
          (listing: Listing) => listing.owner === user.id
        );

        setListings(filteredListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user?.id]);

  const handleListingClick = (e: React.MouseEvent, propertyId: number) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("button") &&
      !target.closest("a") &&
      !target.closest("input") &&
      !target.closest("select")
    ) {
      navigate(`/properties/${propertyId}`);
    }
  };

  // Fetch favorite properties
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) {
        setFavoritesLoading(false);
        return;
      }
      try {
        setFavoritesLoading(true);
        const response = await axios.get(
          "http://localhost:8000/account/favorite/",
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorite properties:", error);
        setFavoritesError("Failed to load your favorite properties");
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id]);

  // Fetch property requests (created by this user or, if admin, all requests)
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.id) {
        setRequestsLoading(false);
        return;
      }
      try {
        setRequestsLoading(true);
        const response = await axios.get(
          "http://localhost:8000/property/requests/",
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching property requests:", error);
        setRequestsError("Failed to load property requests");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, [user?.id]);

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
          <p className="mb-6 text-gray-600">
            You need to be logged in to view your listings
          </p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* New Profile Header Section */}
      <div className="mb-8 rounded-md bg-gray-100 p-6 shadow-sm">
        <h1 className="mt-2 text-lg text-gray-700">@{user.username}</h1>
        {user.is_staff && (
          <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Admin
          </span>
        )}
      </div>

      {/* Created Listings Section */}
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
            <p className="text-gray-600">
              You haven't created any listings yet
            </p>
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
                      listing.status === "active"
                        ? "bg-green-100 text-green-800"
                        : listing.status === "rented"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {listing.status.charAt(0).toUpperCase() +
                      listing.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-xl font-semibold">{listing.title}</h3>
                <p className="mb-4 text-gray-600">{listing.location}</p>
                <p className="mb-4 text-2xl font-bold text-blue-600">
                  ${listing.price}/month
                </p>
                <div className="flex justify-between border-t pt-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">{listing.views}</span> views
                  </div>
                  <div>
                    <span className="font-medium">{listing.inquiries}</span>{" "}
                    inquiries
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Favorites Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">My Favorite Properties</h2>
        {favoritesLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading favorite properties...</p>
          </div>
        ) : favoritesError ? (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {favoritesError}
          </div>
        ) : favorites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">
              You haven't added any properties to your favorites yet
            </p>
            <Link to="/properties" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/properties/${fav.id}`)}
              >
                <div className="relative">
                  <img
                    src={fav.images[0]}
                    alt={fav.title}
                    className="h-48 w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-xl font-semibold">{fav.title}</h3>
                  <p className="mb-4 text-gray-600">{fav.location}</p>
                  <p className="mb-4 text-2xl font-bold text-blue-600">
                    ${fav.price}/month
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Section: Property Requests */}
      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">My Property Requests</h2>
        {requestsLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading property requests...</p>
          </div>
        ) : requestsError ? (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {requestsError}
          </div>
        ) : requests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">
              You haven't created any property requests yet
            </p>
            <Link to="/create-listing" className="mt-4 inline-block">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/requests/${req.id}`)}
              >
                <div className="relative">
                  <img
                    src={req.images && req.images[0]}
                    alt={req.title}
                    className="h-48 w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-xl font-semibold">
                    {req.title || "No title"}
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {req.location || "No location"}
                  </p>
                  <p className="mb-4 text-2xl font-bold text-blue-600">
                    ${req.price ? req.price : 0}/month
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
