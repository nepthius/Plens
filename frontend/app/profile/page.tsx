"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

// Define the expected user profile structure from the API
interface UserProfile {
  username: string;
  email: string;
}

export default function ProfilePage() {
  const { user: authUser, token, clearAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      setError(null)

      if (!token || !authUser?.id) {
        console.log("No auth token or user found, redirecting to login.")
        router.push('/login');
        return;
      }

      const backendUrl = "http://localhost:3001/api/user/profile";

      try {
        const response = await axios.get<UserProfile>(backendUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        let errorMsg = "Failed to load profile. Please try logging in again.";
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            errorMsg = "Session expired or invalid. Please log in again.";
            clearAuth();
            router.push('/login');
            return;
          } else if (err.response?.data?.message) {
            errorMsg = err.response.data.message;
          } else if (err.request) {
            errorMsg = "Could not connect to server. Is the backend running?";
          }
        }
        setError(errorMsg);
        setProfile(null);
      } finally {
        setIsLoading(false)
      }
    };

    fetchUserProfile();
  }, [token, authUser, router, clearAuth]);

  const handleLogout = () => {
    clearAuth();
    console.log("User logged out, auth cleared.")
    router.push('/login');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center">
            <User className="h-8 w-8 mr-3" /> My Profile
        </h1>
         <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
      </div>

      <Card className="mx-auto max-w-2xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Account Details</CardTitle>
          <CardDescription>Your registered username and email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 w-20">Username:</span>
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 w-20">Email:</span>
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && profile && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Username:</span>
                <span>{profile.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Email:</span>
                <span>{profile.email}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

