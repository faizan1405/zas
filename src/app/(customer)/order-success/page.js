'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ZAS-XXXXX-IND';

  return (
    <div className="container animate-fade" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
      <div style={{ backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-lg)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
        <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
        
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', textTransform: 'uppercase', marginBottom: '8px' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-dark-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Thank you for choosing Zassports. We have received your order. Our team is already preparing to pack your gear!
        </p>

        {/* Order ID display box */}
        <div style={{ margin: '30px 0', padding: '16px', backgroundColor: 'var(--bg-light)', border: '1px dashed var(--bg-light-border)', borderRadius: 'var(--border-radius-md)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dark-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Your Order ID Reference
          </span>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: 'var(--text-dark)', marginTop: '4px' }}>
            {orderId}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link 
            href={`/track-order?orderId=${orderId}`}
            className="btn btn-primary btn-full"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Track Order Live <MapPin size={16} />
          </Link>
          <a 
            href={`https://wa.me/918860654659?text=Hi%20Zassports%2C%20I%20just%20placed%20an%20order.%20My%20Order%20ID%20is%20${orderId}.%20Please%20confirm.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent btn-full"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
          >
            WhatsApp Order Support
          </a>
          <Link 
            href="/shop"
            className="btn btn-secondary btn-full"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ borderTop: '1px solid var(--bg-light-border)', marginTop: '30px', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark-muted)', fontSize: '0.75rem', justifyContent: 'center' }}>
          <ShieldCheck size={18} className="text-success" />
          <span>Stock hold verified. Tracking updates sync directly to this page.</span>
        </div>
      </div>
    </div>
  );
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading Order Details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
