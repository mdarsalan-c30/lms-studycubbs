"use client";

import { registerAdmin } from "./action";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError("");
    // Standard form submission handles the action
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f3f4f6',
      padding: '1rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          Create SUPER_ADMIN
        </h1>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Temporary registration tool for initial setup.
        </p>

        <form action={registerAdmin} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="e.g. Admin Arsalan"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="admin@studycubs.com"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="admin123"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: loading ? '#9ca3af' : '#2563eb', 
              color: 'white', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/db-test" style={{ color: '#2563eb', fontSize: '0.875rem' }}>Back to Diagnostics</a>
        </div>
      </div>
    </div>
  );
}
