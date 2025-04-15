"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function PreviousSearchesPage() {
  const [previousSearches, setPreviousSearches] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load previous searches from localStorage
    const searches = JSON.parse(localStorage.getItem("previousSearches") || "[]")
    setPreviousSearches(searches)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`
    }
  }

  const clearSearchHistory = () => {
    localStorage.removeItem("previousSearches")
    setPreviousSearches([])
  }

  const removeSearch = (index) => {
    const updatedSearches = [...previousSearches]
    updatedSearches.splice(index, 1)
    localStorage.setItem("previousSearches", JSON.stringify(updatedSearches))
    setPreviousSearches(updatedSearches)
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Previous Searches</h1>
        {previousSearches.length > 0 && (
          <Button variant="outline" onClick={clearSearchHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      <div className="mb-8">
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

      {previousSearches.length > 0 ? (
        <div className="grid gap-4">
          {previousSearches.map((search, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <Link
                      href={`/search?query=${encodeURIComponent(search)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {search}
                    </Link>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSearch(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">No previous searches</h2>
          <p className="text-gray-500 mb-4">Your search history will appear here</p>
          <Link href="/">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Start Searching
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

