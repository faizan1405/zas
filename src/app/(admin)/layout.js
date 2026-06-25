'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from 'src/components/AdminSidebar';
import { useStore } from 'src/context/StoreContext';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user } = useStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if session contains admin credentials
    if (user) {
      if (user.role === 'admin') {
        setAuthorized(true);
      } else {
        // Logged in but not admin
        router.push('/');
      }
    } else {
      // Give context some buffer time to hydrarate user session
      const authTimer = setTimeout(() => {
        if (!user) {
          router.push('/admin/login');
        } else if (user.role !== 'admin') {
          router.push('/');
        } else {
          setAuthorized(true);
        }
      }, 1500);
      return () => clearTimeout(authTimer);
    }
  }, [user]);

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '15px', color: 'var(--text-light-muted)', fontWeight: 600 }}>Securing Admin Channels...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div className="admin-layout animate-fade">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
