"use client";

import { useState, useEffect } from "react";
import { getSession, type Session } from "next-auth/react";
import LogoutButton from "@/components/custom/Logout";

// Define types for session state
export interface UserSession extends Session {
  user?: {
    name?: string;
    email?: string;
    id?: number;
  };
  expires?: string;
}

export default function ProfilePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        console.log(sessionData, "Session in Browser");
        setSession(sessionData as UserSession);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 rounded-lg shadow-lg bg-white">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-700 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6">
            <h1 className="text-2xl font-bold text-white text-center">
              User Profile
            </h1>
          </div>

          {session && session.user ? (
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {session.user.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <h2 className="mt-4 text-xl font-bold text-gray-800">
                  {session.user.name || "User"}
                </h2>
                <p className="text-gray-600">
                  {session.user.email || "No email provided"}
                </p>
                {session.user.id && (
                  <span className="mt-2 px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    ID: {session.user.id}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Account Details
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">
                        Email Address
                      </label>
                      <p className="text-gray-800 font-medium">
                        {session.user.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="p-4 bg-red-50 rounded-lg text-red-700 mb-4">
                <p className="font-medium">No active session found.</p>
                <p className="text-sm">Please sign in to view your profile.</p>
              </div>
              <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-medium">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
