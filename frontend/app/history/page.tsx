'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function SearchHistory() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (token) {
      fetchHistory();
    }
  }, [token, isLoading, router]);

  const fetchHistory = async () => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/search-history');
      setHistory(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to fetch search history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div style={{ 
        backgroundColor: "#eeffee", 
        minHeight: "100vh", 
        padding: "20px",
        textAlign: "center" 
      }}>
        <h2>Loading search history...</h2>
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
        <h1 style={{ color: "green", marginBottom: "20px" }}>Search History</h1>
        
        {error && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#ffebee", 
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2>No search history yet</h2>
            <p>Your previous searches will appear here</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {history.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>Searched for: {item.query}</h3>
                  <p style={{ color: "#666", margin: "0" }}>{formatDate(item.timestamp)}</p>
                </div>

                <div style={{ marginTop: "15px" }}>
                  {item.results.map((result, resultIndex) => (
                    <div
                      key={resultIndex}
                      style={{
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        marginBottom: "10px"
                      }}
                    >
                      <h4 style={{ margin: "0 0 5px 0" }}>{result.name}</h4>
                      <p style={{ margin: "0", color: "#666" }}>Risk Level: {result.risk}</p>
                      {result.high.length > 0 && (
                        <p style={{ margin: "5px 0 0 0", color: "#d32f2f" }}>
                          High-Risk Ingredients: {result.high.join(", ")}
                        </p>
                      )}
                      {result.med.length > 0 && (
                        <p style={{ margin: "5px 0 0 0", color: "#f57c00" }}>
                          Medium-Risk Ingredients: {result.med.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 