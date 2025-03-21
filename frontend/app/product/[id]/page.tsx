"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/get_scraper_results`);
        const products = response.data;
        const foundProduct = products.find(p => p.name === decodeURIComponent(params.id));
        
        if (foundProduct) {
          setProduct(foundProduct);
          // Find alternatives (products with lower risk)
          const altProducts = products.filter(p => 
            p.name !== foundProduct.name && 
            ((foundProduct.risk === 'high' && p.risk !== 'high') ||
             (foundProduct.risk === 'medium' && p.risk === 'low'))
          );
          setAlternatives(altProducts);
        }

        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.includes(params.id))
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [params.id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const productId = params.id

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

  if (!product) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <Link href="/search">
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            Back to Search
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/search">
          <button
            style={{
              padding: "5px 10px",
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            Back to Search
          </button>
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>{product.name}</h1>
            <button
              onClick={toggleFavorite}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              {isFavorite ? "❤️" : "♡"}
            </button>
          </div>

          <p
            style={{
              color: "white",
              backgroundColor: getRiskColor(product.risk),
              display: "inline-block",
              padding: "3px 8px",
              borderRadius: "4px",
              marginTop: "10px"
            }}
          >
            {product.risk.toUpperCase()} RISK
          </p>

          {(product.high.length > 0 || product.med.length > 0) && (
            <div style={{ marginTop: "20px" }}>
              <h2>Concerning Ingredients:</h2>
              {product.high.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <h3 style={{ color: 'red' }}>High Risk:</h3>
                  <ul>
                    {product.high.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.med.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <h3 style={{ color: 'orange' }}>Medium Risk:</h3>
                  <ul>
                    {product.med.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              backgroundColor: "#ffffcc",
              padding: "15px",
              border: "1px solid #e6e600",
              marginTop: "20px",
              borderRadius: "4px"
            }}
          >
            <h2>Environmental Impact:</h2>
            <p>
              {product.risk === "high"
                ? "This product contains microplastics that can harm marine life."
                : product.risk === "medium"
                  ? "This product contains ingredients that may contribute to microplastic pollution."
                  : "This product is made with environmentally friendly ingredients."}
            </p>
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Eco-Friendly Alternatives</h2>
          <div>
            {alternatives.map((alt) => (
              <div
                key={alt.name}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "4px"
                }}
              >
                <Link href={`/product/${encodeURIComponent(alt.name)}`} style={{ textDecoration: "none", color: "black" }}>
                  <h3>{alt.name}</h3>
                  <p
                    style={{
                      color: "white",
                      backgroundColor: getRiskColor(alt.risk),
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "4px"
                    }}
                  >
                    {alt.risk.toUpperCase()} RISK
                  </p>
                  {alt.high.length === 0 && alt.med.length === 0 && (
                    <p style={{ color: 'green', marginTop: '10px' }}>No concerning ingredients found</p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 