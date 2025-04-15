"use client"

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import IngredientTooltip from "../../components/tooltip";


// --- Interfaces (reuse or define appropriately) ---
interface ProductDetail { // Simplified structure for now
  _id: string;
  name: string;
  risk: string;
  high: string[]; // Store as array
  med: string[];  // Store as array
  // Add other fields if needed/fetched
}

interface AlternativeProduct {
    _id: string;
    name: string;
    risk: string;
    high?: string[];
    med?: string[];
}

interface AlternativesApiResponse {
    results: AlternativeProduct[];
}
// -----------------------------------------------------

// Helper function to capitalize
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

// Helper function to render risk badge styling (copied from search page)
const getRiskStyling = (riskLevel: string | undefined) => {
    const lowerRisk = riskLevel?.toLowerCase() || 'unknown';
    let riskColorClass = 'bg-gray-100 border-gray-200'; 
    let riskTextColor = 'text-gray-500';
    let riskText = 'Unknown Risk';

    if (lowerRisk === 'low') {
      riskColorClass = 'bg-green-50 border-green-200'; 
      riskTextColor = 'text-green-700';
      riskText = 'Low Risk';
    } else if (lowerRisk === 'medium') {
      riskColorClass = 'bg-yellow-50 border-yellow-300'; 
      riskTextColor = 'text-yellow-700';
      riskText = 'Medium Risk';
    } else if (lowerRisk === 'high') {
      riskColorClass = 'bg-red-50 border-red-300'; 
      riskTextColor = 'text-red-700';
      riskText = 'High Risk';
    }
    return { riskColorClass, riskTextColor, riskText };
};

function ProductDetailsComponent() {
  const params = useParams();
  const searchParams = useSearchParams(); // To potentially get initial data if passed
  const productId = params.id as string;

  // State for the main product (initially from searchParams or fetched)
  // NOTE: This is simplified. Ideally, fetch this product by ID.
  const [mainProduct, setMainProduct] = useState<ProductDetail | null>(() => {
      const name = searchParams.get('name');
      const risk = searchParams.get('risk');
      const highString = searchParams.get('high');
      const medString = searchParams.get('med');

      if (!name || !risk) {
          // Basic info missing, cannot proceed
          return null;
      }

      return {
          _id: productId,
          name: name,
          risk: risk,
          high: highString ? highString.split('|') : [], // Split back into array
          med: medString ? medString.split('|') : []    // Split back into array
      };
  });
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Alternatives (depends on mainProduct being initialized) --- 
  useEffect(() => {
    if (!mainProduct) { 
        // This will be true if required params (name, risk) were missing
        setError("Could not load product details from URL.");
        setIsLoadingAlternatives(false); // Stop loading alternatives
        return;
    }
    
    const fetchAlternatives = async () => {
      setIsLoadingAlternatives(true);
      setError(null); 

      // Ensure name and risk are available (already checked during init, but good practice)
      if (!mainProduct.name || !mainProduct.risk) {
          setError("Cannot fetch alternatives: missing product name or risk.")
          setIsLoadingAlternatives(false);
          return;
      }

      const backendUrl = `http://localhost:3001/api/products/alternatives`; 
      console.log(`Fetching alternatives for: ${mainProduct.name} (Risk: ${mainProduct.risk})`);

      try {
        const response = await axios.get<AlternativesApiResponse>(backendUrl, {
          params: {
            name: mainProduct.name,       
            currentRisk: mainProduct.risk 
          }
        });
        console.log("[DEBUG] Alternatives API Response:", response.data);
        setAlternatives(response.data.results || []);
      } catch (err) {
        console.error("Error fetching alternatives:", err);
        let errorMsg = "Failed to load alternative products.";
        if (axios.isAxiosError(err)) {
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.request) {
                errorMsg = "Could not connect to server for alternatives.";
            }
        }
        setError(errorMsg);
        setAlternatives([]);
      } finally {
        setIsLoadingAlternatives(false);
      }
    };

    fetchAlternatives();
  }, [mainProduct]); // Trigger when mainProduct is set

  // --- Render Main Product --- 
  const renderMainProduct = () => {
      if (!mainProduct) {
          // Display error set during initialization or fetching alternatives
          return <p className="text-red-600 mb-8 text-center">{error || "Error loading product details."}</p>; 
      }
      const { riskColorClass, riskTextColor, riskText } = getRiskStyling(mainProduct.risk);
      return (
          <Card className={cn("mb-8 border", riskColorClass)}>
              <CardHeader>
                   <CardTitle className="flex justify-between items-center">
                      <span>{mainProduct.name}</span> 
                      <span className={cn("inline-block px-2 py-1 text-sm font-semibold rounded", riskColorClass, riskTextColor)}>
                          {riskText}
                      </span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                    {/* Display High-Risk Ingredients */}
                    {mainProduct.high && mainProduct.high.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-sm text-red-700">High-Risk Ingredients:</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-red-600">
                          {mainProduct.high.map((ing, index) => <li key={`main-high-${index}`}>{ing}</li>)}
                        </ul>
                      </div>
                    )}
                    {/* Display Medium-Risk Ingredients */}
                    {mainProduct.med && mainProduct.med.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-sm text-yellow-700">Medium-Risk Ingredients:</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-yellow-600">
                          {mainProduct.med.map((ing, index) => <li key={`main-med-${index}`}>{ing}</li>)}
                        </ul>
                      </div>
                    )}
                    {(!mainProduct.high || mainProduct.high.length === 0) && (!mainProduct.med || mainProduct.med.length === 0) && (
                       <p className="text-sm text-gray-500 mb-2">No concerning ingredients listed for this product.</p>
                    )}
              </CardContent>
          </Card>
      );
  };

  // --- Render Alternatives --- 
  const renderAlternatives = () => {
      if (isLoadingAlternatives) {
          return <p className="text-center text-gray-500">Loading alternatives...</p>;
      }
      if (error && alternatives.length === 0) {
           return <p className="text-center text-red-600">{error}</p>;
      }
       if (alternatives.length === 0) {
          return <p className="text-center text-gray-500">No lower-risk alternatives found.</p>;
      }
      return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alt) => {
                  const { riskColorClass, riskTextColor, riskText } = getRiskStyling(alt.risk);
                  return (
                    <Link href={`/product/${alt._id}?name=${encodeURIComponent(alt.name)}&risk=${alt.risk}&high=${alt.high?.join('|') ?? ''}&med=${alt.med?.join('|') ?? ''}`} key={alt._id} className="block hover:opacity-90 transition-opacity">
                       <Card key={alt._id} className={cn("border h-full", riskColorClass)}>
                           <CardHeader>
                               <CardTitle className="flex justify-between items-center text-base"> 
                                   <span>{alt.name}</span>
                                   <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded", riskColorClass, riskTextColor)}>
                                       {riskText}
                                   </span>
                               </CardTitle>
                           </CardHeader>
                            <CardContent>
                                {alt.high && alt.high.length > 0 && (
                                  <div className="mb-1 mt-2">
                                    <p className="font-semibold text-xs text-red-700">High-Risk:</p>
                                    <p className="text-xs text-red-600">{alt.high.join(", ")}</p>
                                  </div>
                                )}
                                 {alt.med && alt.med.length > 0 && (
                                  <div className="mb-1 mt-2">
                                    <p className="font-semibold text-xs text-yellow-700">Medium-Risk:</p>
                                    <p className="text-xs text-yellow-600">{alt.med.join(", ")}</p>
                                  </div>
                                )}
                                {(!alt.high || alt.high.length === 0) && (!alt.med || alt.med.length === 0) && (
                                   <p className="text-xs text-gray-500 mt-2">No concerning ingredients listed.</p>
                                )}
                            </CardContent>
                       </Card>
                     </Link>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
        {/* Optional Back Button */} 
        <div className="mb-6">
             <Button variant="outline" size="sm" asChild>
               <Link href="/search"> 
                 <ArrowLeft className="h-4 w-4 mr-2" />
                 Back to Search
               </Link>
            </Button>
        </div>

        {renderMainProduct()}

        <h2 className="text-2xl font-bold tracking-tight mb-6 border-t pt-8">Lower-Risk Alternatives</h2>
        {renderAlternatives()}
    </div>
  );
}

// Wrap with Suspense for useParams/useSearchParams
export default function ProductPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center">Loading product details...</div>}>
      <ProductDetailsComponent />
    </Suspense>
  );
}

