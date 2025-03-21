'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const response = await api.post("/api/submit_product", { name: query });
        setResults(response.data.results);
        setError('');

        // Save to search history if user is logged in
        if (user && token) {
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await api.post('/api/auth/search-history', {
              query,
              results: response.data.results
            });
          } catch (error) {
            console.error('Error saving to search history:', error);
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        setError('Failed to fetch results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, router, user, token]);

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#44aa44';
      default:
        return '#666666';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: "#eeffee", 
        minHeight: "100vh", 
        padding: "20px",
        textAlign: "center" 
      }}>
        <h2>Searching for "{query}"...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: "#eeffee", 
        minHeight: "100vh", 
        padding: "20px",
        textAlign: "center" 
      }}>
        <h2 style={{ color: "#ff4444" }}>{error}</h2>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: "8px 16px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Return to Search
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#eeffee", 
      minHeight: "100vh", 
      padding: "20px" 
    }}>
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto" 
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h1 style={{ color: "green" }}>Search Results for "{query}"</h1>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: "8px 16px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            New Search
          </button>
        </div>

        {results.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2>No results found</h2>
            <p>Try searching for a different product</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "15px"
                }}>
                  <h2 style={{ 
                    margin: "0",
                    color: "#333",
                    fontSize: "1.5rem"
                  }}>{result.name}</h2>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: getRiskColor(result.risk),
                    color: "white",
                    fontWeight: "bold"
                  }}>
                    {result.risk.toUpperCase()} RISK
                  </span>
                </div>

                <div style={{ marginTop: "15px" }}>
                  {result.high.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <h3 style={{ color: "#ff4444", margin: "0 0 5px 0" }}>High-Risk Ingredients:</h3>
                      <p style={{ margin: 0 }}>{result.high.join(", ")}</p>
                    </div>
                  )}
                  {result.med.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <h3 style={{ color: "#ffaa00", margin: "0 0 5px 0" }}>Medium-Risk Ingredients:</h3>
                      <p style={{ margin: 0 }}>{result.med.join(", ")}</p>
                    </div>
                  )}
                  {result.high.length === 0 && result.med.length === 0 && (
                    <div style={{ color: "#44aa44" }}>
                      <p>No high or medium risk ingredients found!</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 