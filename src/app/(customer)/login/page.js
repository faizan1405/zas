'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useStore } from 'src/context/StoreContext';

const LoginRegisterPage = () => {
  const router = useRouter();
  const { user, loginUser, cart } = useStore();

  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (cart.length > 0) {
        router.push('/cart');
      } else {
        router.push('/account');
      }
    }
  }, [user, cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage('');
    
    // Client-side validations
    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!isLoginView) {
      if (!name) {
        setErrorMessage('Name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    try {
      setLoading(true);
      const url = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const bodyPayload = isLoginView ? { email, password } : { name, email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        loginUser(data.user);
        // Redirect logic
        if (cart.length > 0) {
          router.push('/cart');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Authentication submission error:', err);
      setErrorMessage('Network error submitting credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ maxWidth: '450px', margin: '60px auto' }}>
      <div style={{ backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-lg)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Toggle Title */}
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', textTransform: 'uppercase', textAlign: 'center', marginBottom: '10px' }}>
          {isLoginView ? 'Sign In' : 'Create Account'}
        </h1>
        <p style={{ color: 'var(--text-dark-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '30px' }}>
          {isLoginView ? 'Welcome back! Sign in to access your orders.' : 'Join the Apex Club to save your profile address.'}
        </p>

        {errorMessage && (
          <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Name Field (Register Only) */}
          {!isLoginView && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Robin Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '35px' }}
                  required
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-muted)' }} />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="robin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '35px' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-muted)' }} />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '35px' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-muted)' }} />
            </div>
          </div>

          {/* Confirm Password Field (Register Only) */}
          {!isLoginView && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '35px' }}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark-muted)' }} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLoginView ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
          </button>

          {/* Toggle Button */}
          <button 
            type="button" 
            onClick={() => {
              setIsLoginView(!isLoginView);
              setErrorMessage('');
            }}
            style={{ fontSize: '0.85rem', color: 'var(--text-dark-muted)', fontWeight: 600, textAlign: 'center', marginTop: '10px', textDecoration: 'underline' }}
          >
            {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--bg-light-border)', marginTop: '30px', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark-muted)', fontSize: '0.75rem', justifyContent: 'center' }}>
          <ShieldCheck size={18} className="text-success" />
          <span>Secure authentication. Session holds for 7 days.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;
