'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Key, User, ArrowRight } from 'lucide-react';
import { useStore } from 'src/context/StoreContext';

const AdminLoginPage = () => {
  const router = useRouter();
  const { user, loginUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto redirect if already logged in as admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user]);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Fill in all administrator credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (data.user.role === 'admin') {
          loginUser(data.user);
          router.push('/admin');
        } else {
          setErrorMessage('Access Denied. Standard client accounts cannot enter admin portals.');
          setLoading(false);
        }
      } else {
        setErrorMessage(data.error || 'Invalid administrator credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Admin login submission error:', err);
      setErrorMessage('Network error connecting to authentication servers.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#0e1726', border: '1px solid #1f2937', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '420px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'rgba(204, 255, 0, 0.1)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'var(--primary)' }}>
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', textTransform: 'uppercase', color: 'white' }}>
            Apex Admin Panel
          </h1>
          <p style={{ color: 'var(--text-light-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            Authorization is required for store management credentials.
          </p>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px', lineHeight: '1.4' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-light-muted)' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="admin@apexcricket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ backgroundColor: '#090d16', color: 'white', border: '1px solid #1f2937', paddingLeft: '35px' }}
                required
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-light-muted)' }}>Security Key Phrase</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ backgroundColor: '#090d16', color: 'white', border: '1px solid #1f2937', paddingLeft: '35px' }}
                required
              />
              <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light-muted)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-accent btn-full"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Verifying Secures...' : 'Enter Console'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #1f2937', paddingTop: '15px' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
            ← Back to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;
