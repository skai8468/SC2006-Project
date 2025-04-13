import React, { useEffect, useState } from "react";
import { Home, LogOut, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// import { Button } from "../components/ui/button";
// Removed unused ThemeToggle import
import { useAuth } from "../components/auth/auth-context";

import { PropertyRequest } from "../types/property";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Ensure your auth context provides `token`
  const [propertyRequests, setPropertyRequests] = useState<PropertyRequest[]>(
    []
  );

  const token = localStorage.getItem("authToken");

  const fetchPropertyRequests = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/property/requests/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setPropertyRequests(response.data);
    } catch (error) {
      console.error("Error fetching property requests:", error);
    }
  };

  useEffect(() => {
    fetchPropertyRequests();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
      // Remove the approved request from state
      setPropertyRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error: unknown) {
      // Narrow error type
      if (axios.isAxiosError(error)) {
        console.error(
          "Error approving property request:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error approving property request:", error);
      }
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
      // Remove the denied request from state
      setPropertyRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error rejecting property request:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error rejecting property request:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Property Requests
          </h1>
          {propertyRequests.length === 0 ? (
            <p>No property requests available.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {propertyRequests.map((req) => (
                  <li key={req.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {req.title || "No title"}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            {req.location || "No location"}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            Owner: {req.user || "Unknown"}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDeny(req.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Deny</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
