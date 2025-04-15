"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Heart, Clock, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock database of products
const productDatabase = [
  {
    id: 1,
    name: "Ocean Fresh Shampoo",
    risk: "high",
    ingredients: ["Polyethylene (PE)", "Polypropylene (PP)"],
    category: "Personal Care",
  },
  {
    id: 2,
    name: "Ocean Breeze Body Wash",
    risk: "high",
    ingredients: ["Polyethylene (PE)"],
    category: "Personal Care",
  },
  {
    id: 5,
    name: "Pure Clean Facial Cleanser",
    risk: "low",
    ingredients: [],
    category: "Personal Care",
  },
  {
    id: 6,
    name: "Eco-friendly Toothpaste",
    risk: "low",
    ingredients: [],
    category: "Personal Care",
  },
]

export default function ProfilePage() {
  const [favorites, setFavorites] = useState([])
  const [favoriteProducts, setFavoriteProducts] = useState([])
  const [previousSearches, setPreviousSearches] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Simulate logged in state
    setIsLoggedIn(true)

    // Load favorites from localStorage
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(favs)

    // Get favorite products
    const favProducts = productDatabase.filter((p) => favs.includes(p.id))
    setFavoriteProducts(favProducts)

    // Load previous searches from localStorage
    const searches = JSON.parse(localStorage.getItem("previousSearches") || "[]")
    setPreviousSearches(searches)
  }, [])

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">High Risk</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium Risk</Badge>
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">Low Risk</Badge>
      default:
        return null
    }
  }

  const removeFavorite = (productId) => {
    const updatedFavorites = favorites.filter((id) => id !== productId)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    setFavorites(updatedFavorites)
    setFavoriteProducts(favoriteProducts.filter((p) => p.id !== productId))
  }

  if (!isLoggedIn) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-md mx-auto text-center py-12 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-500 mb-4">You need to be logged in to view your profile</p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-gray-500" />
              </div>
              <CardTitle>Jane Doe</CardTitle>
              <p className="text-sm text-gray-500">jane.doe@example.com</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/profile/settings">Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="favorites">
          <TabsList className="mb-4">
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Search History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {favoriteProducts.length > 0 ? (
              <div className="grid gap-4">
                {favoriteProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/product/${product.id}`}>
                            <h3 className="text-lg font-semibold hover:text-blue-600">{product.name}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
                          <div className="flex items-center gap-2">{getRiskBadge(product.risk)}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFavorite(product.id)}>
                          <Heart className="h-4 w-4 fill-current text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                <p className="text-gray-500 mb-4">Products you favorite will appear here</p>
                <Link href="/">
                  <Button>Start Browsing</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {previousSearches.length > 0 ? (
              <div className="grid gap-4">
                {previousSearches.map((search, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <Link
                          href={`/search?query=${encodeURIComponent(search)}`}
                          className="text-blue-600 hover:underline"
                        >
                          {search}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">No search history</h2>
                <p className="text-gray-500 mb-4">Your search history will appear here</p>
                <Link href="/">
                  <Button>Start Searching</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

