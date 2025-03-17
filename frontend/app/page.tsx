'use client';

import { useState, useEffect } from "react";
import axios from "axios";

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function Home() {
  const [productName, setProductName] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [scraperResults, setScraperResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName) {
      alert("Please enter a product name!");
      return;
    }

    try {
      setResponseMessage("Checking database...");
      const response = await api.post("/api/submit_product", { name: productName });
      
      setScraperResults(response.data.results);
      setResponseMessage(response.data.message);
      setProductName("");
    } catch (error) {
      console.error("Error sending product:", error);
      setResponseMessage("Failed to fetch product data. Please make sure the backend server is running.");
    }
  };

  const fetchScraperResults = async () => {
    try {
      const response = await api.get("/api/get_scraper_results");
      setScraperResults(response.data);
    } catch (error) {
      console.error("Error fetching scraper results:", error);
      setScraperResults([]);
    }
  };

  useEffect(() => {
    fetchScraperResults();
  }, []);

  return (
    <div>
      <main>
        <section style={{ backgroundColor: "#eeffee", padding: "20px", textAlign: "center" }}>
          <h1 style={{ color: "green", fontSize: "24px" }}>Microplastic Checker</h1>
          <p>Find out if products contain microplastics</p>

          <form onSubmit={handleSubmit} style={{ margin: "20px auto", maxWidth: "400px" }}>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Search for a product..."
              style={{
                width: "70%",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "green",
                color: "white",
                border: "none",
              }}
            >
              Search
            </button>
          </form>

          {responseMessage && (
            <div style={{ margin: "20px 0" }}>
              <h2>{responseMessage}</h2>
            </div>
          )}

          {scraperResults.length > 0 && (
            <div style={{ margin: "20px 0" }}>
              <h2>Stored Results</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {scraperResults.map((result, index) => (
                  <li key={index} style={{ margin: "20px 0", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
                    <strong>{result.name}</strong> - Risk: {result.risk}
                    <ul style={{ listStyle: "none", padding: "10px 0" }}>
                      {result.high.length > 0 && <li>High-Risk: {result.high.join(", ")}</li>}
                      {result.med.length > 0 && <li>Medium-Risk: {result.med.join(", ")}</li>}
                      {result.high.length === 0 && result.med.length === 0 && <li>Low Risk</li>}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ border: "1px solid #ccc", padding: "15px" }}>
              <h3>Check Risk Levels</h3>
              <p>See if products have microplastics</p>
            </div>

            <div style={{ border: "1px solid #ccc", padding: "15px" }}>
              <h3>Find Alternatives</h3>
              <p>Discover better products</p>
            </div>

            <div style={{ border: "1px solid #ccc", padding: "15px" }}>
              <h3>Save Products</h3>
              <p>Keep track of good products</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 