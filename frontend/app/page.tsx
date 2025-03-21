'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [productName, setProductName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName) {
      alert("Please enter a product name!");
      return;
    }

    // Redirect to search results page with the query
    router.push(`/search?q=${encodeURIComponent(productName)}`);
  };

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
                borderRadius: "4px",
                marginRight: "8px"
              }}
            />
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
              Search
            </button>
          </form>
        </section>

        <section style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            <div style={{ 
              border: "1px solid #ccc", 
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "white"
            }}>
              <h3 style={{ color: "green" }}>Check Risk Levels</h3>
              <p>See if products have microplastics</p>
            </div>

            <div style={{ 
              border: "1px solid #ccc", 
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "white"
            }}>
              <h3 style={{ color: "green" }}>Find Alternatives</h3>
              <p>Discover better products</p>
            </div>

            <div style={{ 
              border: "1px solid #ccc", 
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "white"
            }}>
              <h3 style={{ color: "green" }}>Save Products</h3>
              <p>Keep track of good products</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 