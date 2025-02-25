"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await signOut({
        redirect: false,
        callbackUrl: "/auth/signin",
      });

      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`px-4 py-2 rounded-lg font-medium 
        bg-blue-600 text-white`}
    >
      {isLoggingOut ? (
        <div className="flex items-center justify-center">Logging out...</div>
      ) : (
        <div className="flex items-center justify-center">Sign Out</div>
      )}
    </button>
  );
};

export default LogoutButton;
