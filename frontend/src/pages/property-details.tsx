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
  Trash2,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PropertyImage } from "../components/ui/property-image";
import axios from "axios";
import { format } from "date-fns";

import { PriceHistoryEntry } from "@/types/property";

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

interface User {
  id: number;
  username: string;
}

interface PropertyDetailsPageState {
  currentUser: User | null;
  isFavorite: boolean;
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
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    block: "",
    street_name: "",
    town: "",
    city: "",
    property_type: "",
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    amenities: "",
    images: [],
    status: "",
    latitude: "",
    longitude: "",
    zip_code: "",
  });

  const token = localStorage.getItem("authToken");

  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  const fetchData = async () => {
    try {
      if (token) {
        try {
          const [userRequest, propertyRequest, favoritesRequest] =
            await Promise.all([
              axios.get("http://localhost:8000/property/api/auth/verify/", {
                headers: { Authorization: `Token ${token}` },
              }),
              axios.get(`http://localhost:8000/property/details/${id}`),
              axios.get("http://localhost:8000/account/favorite/", {
                headers: { Authorization: `Token ${token}` },
              }),
            ]);
          setCurrentUser(userRequest.data);
          const isFav = favoritesRequest.data.some((fav: any) => fav.id === id);
          setIsFavorite(isFav);
        } catch (error) {
          console.warn("User not authenticated or token invalid");
          setCurrentUser(null);
          setIsFavorite(false);
        }
      }

      const propertyResponse = await axios.get(
        `http://localhost:8000/property/details/${id}`
      );
      const data = propertyResponse.data;
      setProperty(data);
      setFormData({
        title: data.title,
        description: data.description,
        price: data.price,
        block: data.block,
        street_name: data.street_name,
        town: data.town,
        city: data.city,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.square_feet,
        amenities: data.amenities,
        images: data.images,
        status: data.status,
        latitude: data.latitude,
        longitude: data.longitude,
        zip_code: data.zip_code,
      });

      setImages(
        (data.images || []).map((img: string) =>
          img.startsWith("http")
            ? img
            : `http://localhost:8000/media/property_images/${img}`
        )
      );
      setAmenities(
        typeof data.amenities === "string"
          ? data.amenities.split(",").map((a: string) => a.trim())
          : data.amenities || []
      );
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      // Prepare the payload based on property info or from user input.
      // Here we assume fixed values; you might derive these from property data.
      console.log(property);
      const payload = {
        town: property?.town.toUpperCase() || "TAMPINES",
        flat_type: property
          ? `${property.bedrooms + property.bathrooms}-ROOM`.toUpperCase()
          : "3-ROOM",
      };

      console.log([payload]);
      console.log(token);
      const response = await axios.post(
        "http://127.0.0.1:8000/advanced-features/predict-rent-12-months/",
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );

      // Response expected: { predicted_rent: [number, ...] }
      const preds: number[] = response.data.predicted_rent;
      // Create an array of objects with month labels. Here, we use month numbers.
      // Alternatively, you can create a mapping for month names.
      const today = new Date();
      let currentYear = today.getFullYear();
      let currentMonth = today.getMonth() + 1; // Months 1-12

      const newHistory: PriceHistoryEntry[] = preds.map((price, index) => {
        // increment month based on index
        let month = currentMonth + index;
        let year = currentYear;
        if (month > 12) {
          month = month % 12;
          year += 1;
        }
        // Format month name (optional)
        const date = new Date(year, month - 1, 1);
        const monthLabel = format(date, "MMM yyyy"); // e.g., "Jun 2025"
        return { month: monthLabel, price };
      });
      setPriceHistory(newHistory);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  const isOwner = currentUser && property && property.owner === currentUser.id;

  useEffect(() => {
    fetchData();
  }, [id, token]);

  useEffect(() => {
    if (property) {
      fetchPriceHistory();
    }
  }, [property]);
  if (!property) {
    return <div>Property not found</div>;
  }

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleAddToFavorites = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/account/favorite/add/",
        { property_id: id },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setIsFavorite(true);
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFromFavorites = async () => {
    if (!token) return;

    try {
      await axios.post(
        "http://localhost:8000/account/favorite/remove/",
        { property_id: id },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setIsFavorite(false);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      handleRemoveFromFavorites();
    } else {
      handleAddToFavorites();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    if (!token) throw new Error("No auth token found");
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `http://localhost:8000/property/details/${property.id}/delete/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      alert("Listing deleted successfully!");
      navigate("/my-listings");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete the listing. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8000/property/details/${id}/update/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log('Updated data:', res.data);

      const updatedData = res.data;

      setProperty(updatedData);
      setFormData({
        title: updatedData.title,
        description: updatedData.description,
        price: updatedData.price,
        block: updatedData.block,
        street_name: updatedData.street_name,
        town: updatedData.town,
        city: updatedData.city,
        property_type: updatedData.property_type,
        bedrooms: updatedData.bedrooms,
        bathrooms: updatedData.bathrooms,
        square_feet: updatedData.square_feet,
        amenities: updatedData.amenities,
        images: updatedData.images || [],
        status: updatedData.status,
        latitude: updatedData.latitude,
        longitude: updatedData.longitude,
        zip_code: updatedData.zip_code,
      });
      setImages(
        (updatedData.images || []).map((img: string) =>
          img.startsWith("http")
            ? img
            : `http://localhost:8000/media/property_images/${img}`
        )
      );
      setAmenities(
        typeof updatedData.amenities === "string"
          ? updatedData.amenities.split(",").map((a: string) => a.trim())
          : updatedData.amenities || []
      );
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error("Error saving property:", err);
      alert("Error updating listing. Please check required fields.");
    }
  };

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border bg-white p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {error === "Property not found"
              ? "Property Not Found"
              : "Error Loading Property"}
          </h1>
          <p className="mb-6 text-gray-600">
            {error === "Property not found"
              ? "Sorry, we couldn't find the property you're looking for."
              : "Failed to load property details. Please try again later."}
          </p>
          <Button onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
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
                        selectedImage === index ? "ring-2 ring-blue-500" : ""
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
              {/* <h1 className="text-3xl font-bold">{property.title}</h1> */}
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="text-3xl font-bold w-full border p-2 rounded"
                />
              ) : (
                <h1 className="text-3xl font-bold">{property.title}</h1>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  className={isFavorite ? "text-red-500" : ""}
                >
                  <Heart
                    className="mr-2 h-5 w-5"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                  {isFavorite ? "Saved" : "Save"}
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            <div className="mb-6 flex items-center text-gray-500">
              <MapPin className="mr-2 h-5 w-5" />
              {property.location ||
                `${property.block} ${property.street_name}, ${property.town}, ${property.city}`}
              {/* <div className="mb-6 flex items-center text-gray-500">
                <MapPin className="mr-2 h-5 w-5" />
                {property.location || `${property.block} ${property.street_name}, ${property.town}, ${property.city}`}
              </div> */}
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
              {/* <p className="text-gray-600">{property.description}</p> */}
              {isEditing ? (
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="text-gray-600 w-full border p-2 rounded"
                />
              ) : (
                <p className="text-gray-600">{property.description}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}

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
              <p className="text-3xl font-bold text-blue-600">
                ${property.price}
              </p>
              <p className="text-gray-500">per month</p>
              <br />
              {isOwner && isEditing && (
                <div className="mb-6 space-y-4">
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Listing
                  </Button>
                </div>
              )}
            </div>

            {isOwner && !isEditing && (
              <div className="mb-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Listing
                </Button>
              </div>
            )}

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
                {property.status === "available"
                  ? "Available Now"
                  : property.status}
              </div>
              <div>Property ID: {property.id}</div>
            </div>

            {/* Market Price Trend Chart */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Market Price Trend (Next 12 Months)
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="h-80">
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>Loading price trend...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PropertyDetailsPage;
