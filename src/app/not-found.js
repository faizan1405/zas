import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | Zassports',
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
      }}
    >
      <span style={{ fontSize: '5rem' }} role="img" aria-label="cricket">🏏</span>
      <h1
        style={{
          fontSize: '4rem',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          margin: '10px 0 0',
          color: 'var(--text-dark)',
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '8px' }}>
        This page got bowled out
      </h2>
      <p
        style={{
          color: 'var(--text-dark-muted)',
          maxWidth: '460px',
          marginTop: '12px',
          lineHeight: 1.6,
        }}
      >
        The page you are looking for does not exist or has been moved. Let&apos;s get
        you back in the game.
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '28px' }}>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
        <Link href="/shop" className="btn btn-secondary">
          Shop Collections
        </Link>
      </div>
    </div>
  );
}
