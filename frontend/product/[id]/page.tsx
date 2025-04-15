"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    description: "A refreshing shampoo with ocean scent that leaves your hair feeling clean and fresh.",
    alternatives: [5, 6],
  },
  {
    id: 2,
    name: "Ocean Breeze Body Wash",
    risk: "high",
    ingredients: ["Polyethylene (PE)"],
    category: "Personal Care",
    description: "A refreshing body wash with ocean scent that leaves your skin feeling clean and fresh.",
    alternatives: [5, 6],
  },
  {
    id: 3,
    name: "Mountain Fresh Shampoo",
    risk: "medium",
    ingredients: ["Polyethylene Glycol (PEG)"],
    category: "Personal Care",
    description: "A refreshing shampoo with mountain scent that leaves your hair feeling clean and fresh.",
    alternatives: [5, 6],
  },
  {
    id: 4,
    name: "Natural Glow Face Scrub",
    risk: "high",
    ingredients: ["Polyethylene Microbeads", "Nylon-12"],
    category: "Personal Care",
    description: "An exfoliating face scrub that removes dead skin cells and leaves your skin glowing.",
    alternatives: [5],
  },
  {
    id: 5,
    name: "Pure Clean Facial Cleanser",
    risk: "low",
    ingredients: [],
    category: "Personal Care",
    description: "A gentle facial cleanser made with natural ingredients that effectively removes dirt and oil.",
    alternatives: [],
  },
  {
    id: 6,
    name: "Eco-friendly Toothpaste",
    risk: "low",
    ingredients: [],
    category: "Personal Care",
    description:
      "A natural toothpaste made with plant-based ingredients that effectively cleans teeth without harmful chemicals.",
    alternatives: [],
  },
  {
    id: 7,
    name: "Sparkle Toothpaste",
    risk: "medium",
    ingredients: ["Polyethylene Glycol (PEG)"],
    category: "Personal Care",
    description: "A whitening toothpaste that gives your teeth a sparkling shine.",
    alternatives: [6],
  },
  {
    id: 8,
    name: "Deep Clean Laundry Detergent",
    risk: "high",
    ingredients: ["Polyester (PET)", "Polyethylene (PE)"],
    category: "Household",
    description: "A powerful laundry detergent that removes tough stains and leaves clothes smelling fresh.",
    alternatives: [9],
  },
  {
    id: 9,
    name: "Eco Laundry Detergent",
    risk: "low",
    ingredients: [],
    category: "Household",
    description: "An environmentally friendly laundry detergent made with plant-based ingredients.",
    alternatives: [],
  },
]

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Find product by ID
    const productId = Number.parseInt(params.id)
    const foundProduct = productDatabase.find((p) => p.id === productId)

    if (foundProduct) {
      setProduct(foundProduct)

      // Get alternatives
      if (foundProduct.alternatives.length > 0) {
        const altProducts = productDatabase.filter((p) => foundProduct.alternatives.includes(p.id))
        setAlternatives(altProducts)
      }

      // Check if product is in favorites
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
      setIsFavorite(favorites.includes(productId))
    }
  }, [params.id])

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

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const productId = product.id

    if (isFavorite) {
      const updatedFavorites = favorites.filter((id) => id !== productId)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(false)
    } else {
      favorites.push(productId)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

  if (!product) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Link href="/search">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-4">
        <Link href="/search">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-8">
          <div className="text-6xl text-gray-400 font-light">Product Image</div>
        </div>

        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <Button variant="ghost" size="icon" onClick={toggleFavorite} className={isFavorite ? "text-red-500" : ""}>
              <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          <p className="text-gray-500 mb-4">Category: {product.category}</p>

          <div className="mb-4">{getRiskBadge(product.risk)}</div>

          <p className="mb-6">{product.description}</p>

          {product.ingredients.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Concerning Ingredients:</h2>
              <ul className="list-disc list-inside text-gray-600">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Environmental Impact:</h2>
            <p className="text-gray-700">
              {product.risk === "high"
                ? "This product contains microplastics that can enter waterways and harm marine life. These particles do not biodegrade and can accumulate in the environment."
                : product.risk === "medium"
                  ? "This product contains ingredients that may contribute to microplastic pollution, though at lower levels than high-risk products."
                  : "This product is made with environmentally friendly ingredients that have minimal impact on microplastic pollution."}
            </p>
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Eco-Friendly Alternatives</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((alt) => (
              <Link key={alt.id} href={`/product/${alt.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{alt.name}</h3>
                    <div className="mb-3">{getRiskBadge(alt.risk)}</div>
                    <p className="text-gray-600 mb-4">{alt.description}</p>
                    <p className="text-sm text-blue-600">View details →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

