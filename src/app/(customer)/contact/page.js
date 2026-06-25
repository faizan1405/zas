'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessagesSquare, CheckCircle } from 'lucide-react';
import { useStore } from 'src/context/StoreContext';

const ContactPage = () => {
  const { settings } = useStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inquiry form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Product Query');
  const [message, setMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await fetch('/api/pages/contact-us');
        const data = await res.json();
        if (data.success) {
          setPage(data.page);
        }
        setLoading(false);
      } catch (err) {
        console.log('Error loading contact details page:', err);
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitSuccess(true);
      setSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitSuccess(false), 5000); // clear banner after 5s
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--bg-light-border)', borderTopColor: 'var(--text-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '10px', color: 'var(--text-dark-muted)' }}>Retrieving support desk parameters...</p>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber || '15551234567'}?text=${encodeURIComponent("Hi support team, I have an inquiry about my cricket order.")}`;

  return (
    <div className="container animate-fade" style={{ margin: '40px auto 80px' }}>
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-dark)' }}>Contact Us</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
        {/* Support Forms */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-md)', padding: '40px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', textTransform: 'uppercase', marginBottom: '8px' }}>Send Support Ticket</h2>
          <p style={{ color: 'var(--text-dark-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Fill in the fields below. A cricket expert will resolve your query within 24 hours.</p>

          {submitSuccess && (
            <div style={{ backgroundColor: '#dcfce7', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <CheckCircle size={16} /> Inquiry submitted successfully! Check your inbox shortly.
            </div>
          )}

          <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                placeholder="Robin Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                placeholder="robin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Query Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-control"
              >
                <option value="Product Query">Product / Size Sizing Sizer</option>
                <option value="Shipping Delay">Shipping & Delivery Tracker</option>
                <option value="Cancellation">Order Cancellation & Refunds</option>
                <option value="Bat Engraving">Bat Knocking / engraving custom request</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message details</label>
              <textarea 
                placeholder="Describe your inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm btn-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>

        {/* Dynamic Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid var(--bg-light-border)', borderRadius: 'var(--border-radius-md)', padding: '30px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'Outfit', textTransform: 'uppercase', marginBottom: '20px', borderBottom: '1px solid var(--bg-light-border)', paddingBottom: '10px' }}>HQ Address & Channels</h2>
            
            <div className="footer-contact-info" style={{ color: 'var(--text-dark)' }}>
              <div className="footer-contact-item" style={{ gap: '14px' }}>
                <MapPin size={22} className="text-dark" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark-muted)' }}>Corporate Headquarters</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{settings.address}</p>
                </div>
              </div>
              
              <div className="footer-contact-item" style={{ gap: '14px' }}>
                <Phone size={18} className="text-dark" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark-muted)' }}>Call Helpdesk Hotline</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{settings.contactNumber}</p>
                </div>
              </div>

              <div className="footer-contact-item" style={{ gap: '14px' }}>
                <MessagesSquare size={18} className="text-dark" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark-muted)' }}>WhatsApp Chat Channels</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#20ba5a' }}>
                      {settings.whatsappNumber} (Chat Live)
                    </a>
                  </p>
                </div>
              </div>

              <div className="footer-contact-item" style={{ gap: '14px' }}>
                <Mail size={18} className="text-dark" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dark-muted)' }}>Direct Email Support</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{settings.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps placeholder */}
          <div style={{ width: '100%', height: '220px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--bg-light-border)', position: 'relative', backgroundColor: '#e2e8f0' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.5 }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 1 }}>
              <MapPin size={32} style={{ color: 'var(--text-dark)', margin: '0 auto 8px' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Apex Sports Stadium Arena Map</span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dark-muted)', marginTop: '2px' }}>Interactive navigation panel loaded in production.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
