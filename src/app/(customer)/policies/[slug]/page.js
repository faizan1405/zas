'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PolicyPage = () => {
  const { slug } = useParams();
  const router = useRouter();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/pages/${slug}`);
        const data = await res.json();

        if (data.success && data.page) {
          setPage(data.page);
        } else {
          setError(data.error || 'Policy page not found.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching policy page:', err);
        setError('Network error fetching document content.');
        setLoading(false);
      }
    };

    if (slug) {
      fetchPageContent();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--bg-light-border)', borderTopColor: 'var(--text-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '10px', color: 'var(--text-dark-muted)' }}>Retrieving policy sheets...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Info size={48} className="text-danger" style={{ marginBottom: '15px' }} />
        <h2>Document Not Available</h2>
        <p style={{ color: 'var(--text-dark-muted)', marginTop: '8px' }}>{error}</p>
        <Link href="/" className="btn btn-primary btn-sm" style={{ marginTop: '20px' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade" style={{ maxWidth: '800px', margin: '40px auto 80px' }}>
      
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-dark)' }}>Policies</span>
        <span>/</span>
        <span style={{ color: 'var(--text-dark)' }}>{page.title}</span>
      </div>

      {/* Content wrapper */}
      <article style={{ backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-md)', padding: '40px', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid var(--bg-light-border)', paddingBottom: '15px' }}>
          {page.title}
        </h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dark-muted)', display: 'block', marginBottom: '30px' }}>
          Last Updated: {new Date(page.updatedAt).toLocaleDateString()}
        </span>

        {/* Content body with CSS support for markdown styling */}
        <div 
          className="policy-body-content"
          style={{ lineHeight: '1.8', color: 'var(--text-dark-muted)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}
        >
          {page.content}
        </div>
      </article>

      <style dangerouslySetInnerHTML={{__html: `
        .policy-body-content h2, .policy-body-content h3 {
          color: var(--text-dark);
          font-family: 'Outfit', sans-serif;
          margin: 30px 0 10px;
          text-transform: uppercase;
        }
        .policy-body-content h2 { font-size: 1.3rem; }
        .policy-body-content h3 { font-size: 1.1rem; }
        .policy-body-content p { margin-bottom: 16px; }
        .policy-body-content ul, .policy-body-content ol {
          margin-bottom: 20px;
          padding-left: 20px;
        }
        .policy-body-content li { margin-bottom: 8px; }
      `}} />
    </div>
  );
};

export default PolicyPage;
