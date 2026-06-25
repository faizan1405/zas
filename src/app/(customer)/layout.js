import React from 'react';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

export default function CustomerLayout({ children }) {
  return (
    <div className="customer-store-layout animate-fade">
      <Header />
      <main style={{ minHeight: '65vh' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
