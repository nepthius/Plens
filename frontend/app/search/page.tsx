"use client"

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import IngredientTooltip from "../components/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

interface Ingredient {
  name: string;
  riskLevel?: string;
  description?: string;
}

interface SearchResult {
  _id: string;
  name: string; 
  risk: string; 
  high: string[];
  med: string[];
  timestamp: string;
}

interface ApiResponse {
  message: string;
  results: SearchResult[];
}

type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

const ITEMS_PER_PAGE = 15;

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query') || "";
  const { token } = useAuth();

  const [allResults, setAllResults] = useState<SearchResult[] | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>(query);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('default');

  useEffect(() => {
    setCurrentPage(1);
    
    if (!query) {
      setMessage("Please enter a search term.");
      setIsLoading(false);
      setAllResults([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setMessage(`Searching for "${query}"...`);
      setAllResults(null);

      const backendUrl = "http://localhost:3001/api/submit_product"; 

      try {
        const response = await axios.post<ApiResponse>(backendUrl, { name: query }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAllResults(response.data.results);
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching search results:", error);
        let errorMsg = "Failed to fetch search results.";
        if (axios.isAxiosError(error)) {
          if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error.request) {
            errorMsg = "No response from server. Is the backend running?";
          } else {
            errorMsg = error.message;
          }
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        setMessage(errorMsg);
        setAllResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, token]);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const processedResults = useMemo(() => {
    if (!allResults) return [];

    let filtered = [...allResults];

    if (filterType !== 'All') {
      filtered = filtered.filter(result => 
        (result.risk?.toLowerCase() || 'unknown') === filterType.toLowerCase()
      );
    }

    const riskWeight: { [key in RiskLevel]: number } = { low: 1, medium: 2, high: 3, unknown: 0 };
    
    const getSafeRisk = (riskStr: string): RiskLevel => {
        const lowerRisk = riskStr?.toLowerCase();
        if (lowerRisk === 'low' || lowerRisk === 'medium' || lowerRisk === 'high') {
            return lowerRisk;
        }
        return 'unknown';
    }

    if (sortOrder === 'lowToHigh') {
        filtered.sort((a, b) => riskWeight[getSafeRisk(a.risk)] - riskWeight[getSafeRisk(b.risk)]);
    } else if (sortOrder === 'highToLow') {
        filtered.sort((a, b) => riskWeight[getSafeRisk(b.risk)] - riskWeight[getSafeRisk(a.risk)]);
    }

    return filtered;
  }, [allResults, filterType, sortOrder]);

  const totalPages = Math.ceil(processedResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = processedResults.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
       window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
      setCurrentPage(1);
  }, [filterType, sortOrder]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newQuery = inputValue.trim();
    if (newQuery) {
      router.push(`/search?query=${encodeURIComponent(newQuery)}`);
    }
  };

  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Search Results</h1>

      <form className="flex w-full max-w-md items-center space-x-2 mb-8" onSubmit={handleSearchSubmit}>
          <Input 
            className="flex-1 bg-white"
            name="query"
            placeholder="Search for another product..." 
            type="search" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
      </form>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 border rounded-lg bg-gray-50">
          <div className="flex-1">
            <Label htmlFor="filter-risk" className="text-sm font-medium">Filter by Risk</Label>
             <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-risk" className="w-full mt-1 bg-white">
                <SelectValue placeholder="Select Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Risks</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="flex-1">
            <Label htmlFor="sort-order" className="text-sm font-medium">Sort Order</Label>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger id="sort-order" className="w-full mt-1 bg-white">
                <SelectValue placeholder="Default Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="lowToHigh">Risk: Low to High</SelectItem>
                <SelectItem value="highToLow">Risk: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      {isLoading && <p className="text-center text-gray-500">Loading results...</p>}
      {message && !isLoading && (
        <p className={`text-center mb-6 ${currentResults.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {message} {!isLoading && allResults && `(${processedResults.length} matching results found)`}
        </p>
      )}

      {!isLoading && currentResults.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentResults.map((result) => {
              const riskLevel = result.risk?.toLowerCase() || 'unknown';
              let riskColorClass = 'bg-gray-100 border-gray-200'; 
              let riskTextColor = 'text-gray-500';
              let riskText = 'Unknown Risk';

              if (riskLevel === 'low') {
                riskColorClass = 'bg-green-50 border-green-200'; 
                riskTextColor = 'text-green-700';
                riskText = 'Low Risk';
              } else if (riskLevel === 'medium') {
                riskColorClass = 'bg-yellow-50 border-yellow-300'; 
                riskTextColor = 'text-yellow-700';
                riskText = 'Medium Risk';
              } else if (riskLevel === 'high') {
                riskColorClass = 'bg-red-50 border-red-300'; 
                riskTextColor = 'text-red-700';
                riskText = 'High Risk';
              }
              
              const queryParams = new URLSearchParams();
              queryParams.set('name', result.name);
              queryParams.set('risk', result.risk);
              if (result.high?.length) queryParams.set('high', result.high.join('|'));
              if (result.med?.length) queryParams.set('med', result.med.join('|'));  
              
              const linkHref = `/product/${result._id}?${queryParams.toString()}`;
              
              return (
                <Link href={linkHref} key={result._id} className="block hover:opacity-90 transition-opacity">
                   <Card className={cn("border h-full", riskColorClass)}> 
                    <CardHeader>
                       <CardTitle className="flex justify-between items-center">
                        <span>{result.name}</span> 
                        <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded", riskColorClass, riskTextColor)}>
                            {riskText}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {result.high && result.high.length > 0 && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-sm text-red-700">High-Risk Ingredients:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1 text-red-600">
                          {result.high.map((ing, index) => (
                            <li key={`high-${index}`}>
                              <IngredientTooltip name={ing} />
                            </li>
                          ))}
                          </ul>
                        </div>
                      )}
                      {result.med && result.med.length > 0 && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-sm text-yellow-700">Medium-Risk Ingredients:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1 text-yellow-600">
                          {result.med.map((ing, index) => (
                            <li key={`med-${index}`}>
                              <IngredientTooltip name={ing} />
                            </li>
                          ))}

                          </ul>
                        </div>
                      )}
                      {(!result.high || result.high.length === 0) && (!result.med || result.med.length === 0) && (
                         <p className="text-sm text-gray-500 mb-2">No concerning ingredients listed.</p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-4">Searched on: {new Date(result.timestamp).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                 </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && currentResults.length === 0 && query && (
         <p className="text-center text-gray-500">
             {allResults && allResults.length > 0 ? `No results match the current filter.` : `No results found for "${query}".`}
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}

