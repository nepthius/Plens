'use client'

import { useState, FormEvent } from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setAuth } = useAuth()

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!emailOrUsername || !password) {
      setError("Please enter both email/username and password.")
      setIsLoading(false)
      return
    }

    const backendUrl = "http://localhost:3001/api/login";

    try {
      const response = await axios.post(backendUrl, { 
          emailOrUsername, 
          password 
      });

      if (response.data.token) {
        setAuth({
          username: response.data.username,
          email: response.data.email,
          id: response.data.userId
        }, response.data.token);
        
        router.push('/dashboard');
      } else {
        setError("Login failed: No token received.")
      }

    } catch (err) {
      console.error("Login error:", err);
      let errorMsg = "Login failed. Please try again.";
      if (axios.isAxiosError(err)) {
          if (err.response?.data?.message) {
              errorMsg = err.response.data.message;
          } else if (err.request) {
              errorMsg = "No response from server. Is the backend running?";
          }
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Log in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email-username">Email address or Username</Label>
              <Input
                id="email-username"
                name="email-username"
                type="text"
                required
                className="mt-1"
                placeholder="you@example.com or your_username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

