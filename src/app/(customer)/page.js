import React from 'react';

// Server Component: hosting expired notice on homepage only.
// All other pages (admin, login, product, account, etc.) remain untouched.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          color: '#fff',
          fontSize: 'clamp(2.5rem, 6vw, 6rem)',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.2,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        HOSTING EXPIRED. PLEASE RENEW IT.
      </h1>
    </div>
  );
}
