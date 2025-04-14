import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, CheckCircle, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useAuth } from "../components/auth/auth-context";
import { Property, PropertyRequest, PriceHistoryEntry } from "@/types/property";
import { format } from "date-fns"; // optional, for formatting dates

export function mergeProperties(
  original: Property,
  snapshot: PropertyRequest
): Property {
  return {
    ...original,
    // For each field, if the snapshot has a non-null/undefined value, use that.
    title: snapshot.title ?? original.title,
    block: snapshot.block ?? original.block,
    street_name: snapshot.street_name ?? original.street_name,
    location: snapshot.location ?? original.location,
    town: snapshot.town ?? original.town,
    city: snapshot.city ?? original.city,
    zip_code: snapshot.zip_code ?? original.zip_code,
    price: snapshot.price ?? original.price,
    bedrooms: snapshot.bedrooms ?? original.bedrooms,
    bathrooms: snapshot.bathrooms ?? original.bathrooms,
    square_feet: snapshot.square_feet ?? original.square_feet,
    status: snapshot.status ?? original.status,
    amenities:
      snapshot.amenities &&
      Array.isArray(snapshot.amenities) &&
      snapshot.amenities.length > 0
        ? snapshot.amenities
        : original.amenities,
    description: snapshot.description ?? original.description,
    image: snapshot.image ?? original.image,
    address: snapshot.address ?? original.address,
    latitude: snapshot.latitude ?? original.latitude,
    longitude: snapshot.longitude ?? original.longitude,
    // The created_at and updated_at fields likely remain the original values.
    created_at: original.created_at,
    updated_at: original.updated_at,
    owner: original.owner, // assuming owner doesn't change on update requests
  };
}

export function PropertyRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const [property_rq, setPropertyRq] = useState<PropertyRequest | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);

  const fetchPropertyRq = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/property/requests/${id}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setPropertyRq(response.data);
    } catch (error) {
      console.error("Error fetching property:", error);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      // Prepare the payload based on property info or from user input.
      // Here we assume fixed values; you might derive these from property data.
      const dummy_flat_type = "";
      var dummy_bedrooms, dummy_bathrooms;
      if (property_rq?.bedrooms == null) {
        dummy_bedrooms = property_rq?.property?.bedrooms;
      } else {
        dummy_bedrooms = property_rq?.bedrooms;
      }
      if (property_rq?.bathrooms == null) {
        dummy_bathrooms = property_rq?.property?.bathrooms;
      } else {
        dummy_bathrooms = property_rq?.bathrooms;
      }

      const payload = {
        town: property_rq?.town?.toUpperCase() || "TAMPINES",
        flat_type: property_rq
          ? `${
              (dummy_bedrooms ?? 2) + (dummy_bathrooms ?? 1)
            }-ROOM`.toUpperCase()
          : "3-ROOM",
      };
      console.log(payload);

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

  useEffect(() => {
    fetchPropertyRq();
  }, [id, token]);

  // Once the property is loaded, fetch price history predictions.
  useEffect(() => {
    if (property_rq) {
      fetchPriceHistory();
    }
  }, [property_rq]);

  if (!property_rq) {
    return <div>Property not found</div>;
  }

  let property: Property | null = null;
  if (property_rq) {
    if (property_rq.property) {
      // If there's an original property, merge it with the snapshot from the property request.
      property = mergeProperties(property_rq.property, property_rq);
    } else {
      // If there's no original property (new property request),
      // assume that the snapshot represents the new property data.
      // You might need to ensure all required fields exist, possibly by providing defaults.
      property = {
        id: 0, // you might set this to 0 or some placeholder value
        owner: property_rq.user, // assuming user id here
        title: property_rq.title || "",
        block: property_rq.block || null,
        street_name: property_rq.street_name || "",
        location: property_rq.location || "",
        town: property_rq.town || null,
        city: property_rq.city || "Singapore",
        zip_code: property_rq.zip_code || null,
        price: property_rq.price || 0,
        bedrooms: property_rq.bedrooms || 0,
        bathrooms: property_rq.bathrooms || 0,
        square_feet: property_rq.square_feet || 0,
        type: property_rq.property_type || "HDB",
        status: property_rq.status || "available",
        amenities: property_rq.amenities || [],
        description: property_rq.description || "",
        image: property_rq.image || "",
        address: property_rq.address || "",
        latitude: property_rq.latitude || null,
        longitude: property_rq.longitude || null,
        created_at: property_rq.created_at || "",
        updated_at: property_rq.created_at || "",
      };
    }
  }

  // Make sure the id parameter is typed as number
  const handleApprove = async (id: number) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/property/requests/${id}/accept/`,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      console.log("Approved property request:", response.data);
      navigate("/admin");
    } catch (error: unknown) {
      let errorMsg = "An error occurred";
      if (axios.isAxiosError(error)) {
        errorMsg =
          typeof error.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error.response?.data) || error.message;
      }
      alert("Error approving property request: " + errorMsg);
      console.error("Error approving property request:", error);
    }
  };

  const handleDeny = async (id: number) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/property/requests/${id}/reject/`,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      console.log("Denied property request:", response.data);
      navigate("/admin");
    } catch (error: unknown) {
      let errorMsg = "An error occurred";
      if (axios.isAxiosError(error)) {
        errorMsg =
          typeof error.response?.data === "string"
            ? error.response.data
            : JSON.stringify(error.response?.data) || error.message;
      }
      alert("Error rejecting property request: " + errorMsg);
      console.error("Error rejecting property request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">
                Property Details
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {property?.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {property?.location}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {property?.owner}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {property?.status}
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {property?.description}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${property?.price}/month
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {property?.bedrooms} bedrooms • {property?.bathrooms}{" "}
                    bathrooms • {property?.square_feet} sq ft
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Amenities
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {property?.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
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

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => handleApprove(property_rq.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Property
            </button>
            <button
              onClick={() => handleDeny(property_rq.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Deny Property
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
