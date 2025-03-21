'use client';

import Link from "next/link"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/profile'); // Redirect to profile page
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div style={{ 
      backgroundColor: "#eeffee", 
      minHeight: "100vh", 
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
      }}>
        <h1 style={{ color: "green", textAlign: "center", marginBottom: "20px" }}>Login to Plens</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Enter your email and password
        </p>

        {error && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#ffebee", 
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{ 
              display: "block", 
              marginBottom: "5px",
              color: "#333"
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "5px"
            }}>
              <label htmlFor="password" style={{ color: "#333" }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ 
                fontSize: "14px", 
                color: "green",
                textDecoration: "none"
              }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            Login
          </button>
        </form>

        <div style={{ 
          textAlign: "center", 
          color: "#666",
          fontSize: "14px" 
        }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ 
            color: "green",
            textDecoration: "none",
            fontWeight: "500"
          }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 