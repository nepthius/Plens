'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import IngredientTooltip from "@/components/IngredientTooltip";

interface Product {
  _id: string;
  name: string;
  risk: string;
  high?: string[];
  med?: string[];
}

interface Suggestions {
  [key: string]: any[];
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      console.log("[DEBUG] Dashboard: Checking auth status...");
      console.log("[DEBUG] Dashboard: Token:", token ? "Present" : "Missing");
      console.log("[DEBUG] Dashboard: User:", user);

      if (!token || !user?.id) {
        console.log("[DEBUG] Dashboard: No token or user ID found, redirecting to login");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      setIsLoading(true);

      try {
        console.log("[DEBUG] Dashboard: Fetching products...");
        const res = await fetch("http://localhost:3001/api/user/products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("[DEBUG] Dashboard: Products fetched successfully:", data.products?.length || 0);
          setSavedProducts(data.products || []);
        } else if (res.status === 404) {
          console.log("[DEBUG] Dashboard: User has no products saved yet. Staying on dashboard.");
          setSavedProducts([]);
        } else {
          console.error(`[ERROR] Dashboard: Failed to fetch products (status ${res.status})`);
          setMessage("Could not load products. Please try again later.");
          setSavedProducts([]);
        }
      } catch (err) {
        console.error("[DEBUG] Dashboard: Network error fetching products:", err);
        setMessage("Could not load products due to a network issue. Please try again later.");
        setSavedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [token, user, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    console.warn("[WARN] Dashboard: Rendered without user.");
    return null;
  }

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/user/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setSavedProducts(savedProducts.filter((p) => p._id !== productId));
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to delete product.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  const handleReplace = async (originalId: string, newProduct: { name: string }) => {
    try {
      await fetch(`http://localhost:3001/api/user/products/${originalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const res = await fetch("http://localhost:3001/api/user/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProduct.name }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setSavedProducts(prev =>
          prev
            .filter((p) => p._id !== originalId)
            .concat(data.product)
        );
        setSuggestions(prev => {
          const newSuggestions = { ...prev };
          delete newSuggestions[originalId];
          return newSuggestions;
        });
      }
    } catch (err) {
      console.error("Replace failed:", err);
      setMessage("Failed to replace product.");
    }
  };
  
  const findAlternatives = async (name: string, currentRisk: string, originalId: string) => {
    if (suggestions[originalId]) {
      setSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[originalId];
        return newSuggestions;
      });
      return;
    }
  
    try {
      const res = await fetch(
        `http://localhost:3001/api/products/alternatives?name=${encodeURIComponent(name)}&currentRisk=${currentRisk}`
      );
      const data = await res.json();
  
      if (res.ok && data.results.length > 0) {
        setSuggestions(prev => ({
          ...prev,
          [originalId]: data.results,
        }));
      } else {
        setSuggestions(prev => ({
          ...prev,
          [originalId]: [],
        }));
        setMessage("No lower-risk alternatives found.");
      }
    } catch (err) {
      console.error("Error finding alternatives:", err);
      setMessage("Error finding alternatives.");
    }
  };

  const getRiskCount = (riskLevel: string) => {
    return savedProducts.filter((p) => {
      if (riskLevel === "low") return !p.high?.length && !p.med?.length;
      return p.risk === riskLevel;
    }).length;
  };
  
  const ingredientMap: { [key: string]: number } = {};
  
  savedProducts.forEach((p) => {
    (p.high || []).forEach((ing) => {
      ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
    });
    (p.med || []).forEach((ing) => {
      ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
    });
  });
  
  const topIngredients = Object.entries(ingredientMap)
    .sort((a, b) => b[1] - a[1])
    .map(([ingredient]) => ingredient);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setMessage("Please enter a product name");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/user/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: productName }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSavedProducts(prev => [...prev, data.product]);
        setProductName("");
        setMessage("Product added successfully!");
      } else {
        setMessage(data.message || "Failed to add product. Please try again.");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">{user?.username}&apos;s Dashboard</h2>
  
      <form onSubmit={handleAddProduct} className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Enter skincare product"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </form>
  
      {message && (
        <p className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg">{message}</p>
      )}
  
      {savedProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <p className="mb-2">
            You&apos;ve saved {savedProducts.length} product{savedProducts.length !== 1 ? "s" : ""}.
          </p>
          <p className="mb-2">
            {getRiskCount("high")} high-risk, {getRiskCount("medium")} medium-risk, {getRiskCount("low")} low-risk products.
          </p>
          {topIngredients.length > 0 && (
            <p>
              Most flagged ingredients: <strong>{topIngredients.slice(0, 3).join(", ")}</strong>
            </p>
          )}
        </div>
      )}
  
      <h3 className="text-xl font-semibold mb-4">My Skincare Products</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedProducts.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(product._id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => findAlternatives(product.name, product.risk, product._id)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Find Alternatives
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {product.high && product.high.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">High Risk Ingredients:</h4>
                  <ul className="space-y-1">
                    {product.high.map((ingredient, index) => (
                      <li key={index} className="text-sm">
                        <IngredientTooltip name={ingredient} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.med && product.med.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-yellow-600 mb-2">Medium Risk Ingredients:</h4>
                  <ul className="space-y-1">
                    {product.med.map((ingredient, index) => (
                      <li key={index} className="text-sm">
                        <IngredientTooltip name={ingredient} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestions[product._id] && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-green-600 mb-2">Alternative Products:</h4>
                  <ul className="space-y-2">
                    {suggestions[product._id].map((suggestion, index) => (
                      <li key={index} className="text-sm">
                        <button
                          onClick={() => handleReplace(product._id, suggestion)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {suggestion.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 