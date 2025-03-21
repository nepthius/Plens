"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, isLoading, updateProfile, logout } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('favorites')
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      setName(user.name)
    }

    // Load favorites from localStorage
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(favs)

    // Fetch search history from the backend
    const fetchSearchHistory = async () => {
      try {
        const response = await axios.get('/api/get_scraper_results')
        setSearchHistory(response.data)
      } catch (error) {
        console.error('Error fetching search history:', error)
        setSearchHistory([])
      }
    }

    fetchSearchHistory()
  }, [user, isLoading, router])

  const removeFavorite = (productName) => {
    const updatedFavorites = favorites.filter((name) => name !== productName)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    setFavorites(updatedFavorites)
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case "high":
        return "red"
      case "medium":
        return "orange"
      case "low":
        return "green"
      default:
        return "black"
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    try {
      await updateProfile(name)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading || !user) {
    return (
      <div style={{ 
        backgroundColor: "#eeffee", 
        minHeight: "100vh", 
        padding: "20px",
        textAlign: "center" 
      }}>
        <h2>Loading profile...</h2>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: "#eeffee", 
      minHeight: "100vh", 
      padding: "20px" 
    }}>
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "green", marginBottom: "20px" }}>Profile</h1>

        {error && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#ffebee", 
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#e8f5e9", 
            color: "#2e7d32",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {successMessage}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "#f5f5f5"
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setName(user.name)
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Name:</strong> {user.name}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 