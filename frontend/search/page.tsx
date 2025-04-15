"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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
    id: 3,
    name: "Mountain Fresh Shampoo",
    risk: "medium",
    ingredients: ["Polyethylene Glycol (PEG)"],
    category: "Personal Care",
  },
  {
    id: 4,
    name: "Natural Glow Face Scrub",
    risk: "high",
    ingredients: ["Polyethylene Microbeads", "Nylon-12"],
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
  {
    id: 7,
    name: "Sparkle Toothpaste",
    risk: "medium",
    ingredients: ["Polyethylene Glycol (PEG)"],
    category: "Personal Care",
  },
  {
    id: 8,
    name: "Deep Clean Laundry Detergent",
    risk: "high",
    ingredients: ["Polyester (PET)", "Polyethylene (PE)"],
    category: "Household",
  },
  {
    id: 9,
    name: "Eco Laundry Detergent",
    risk: "low",
    ingredients: [],
    category: "Household",
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])

  // Get the search query from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get("query")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [])

  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Filter products based on search query
    const results = productDatabase.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))

    setSearchResults(results)

    // Save to previous searches (in a real app, this would be saved to a database or local storage)
    const previousSearches = JSON.parse(localStorage.getItem("previousSearches") || "[]")
    if (!previousSearches.includes(query)) {
      previousSearches.unshift(query)
      localStorage.setItem("previousSearches", JSON.stringify(previousSearches.slice(0, 10)))
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(searchQuery)

    // Update URL with search query
    const url = new URL(window.location.href)
    url.searchParams.set("query", searchQuery)
    window.history.pushState({}, "", url)
  }

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

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
          <Input
            className="flex-1"
            placeholder="Search for a product..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid gap-4">
          {searchResults.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                      <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
                      <div className="flex items-center gap-2 mb-2">{getRiskBadge(product.risk)}</div>
                      {product.ingredients.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Concerning ingredients:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {product.ingredients.map((ingredient, index) => (
                              <li key={index}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-blue-600">View alternatives →</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-500">Try searching for a different product</p>
        </div>
      ) : null}
    </div>
  )
}

