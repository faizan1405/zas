'use client';

import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields state
  const [storeName, setStoreName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shippingCharges, setShippingCharges] = useState(10);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState(100);
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [taxPercent, setTaxPercent] = useState(12);

  // Social Links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const setObj = data.settings;
        setSettings(setObj);
        
        setStoreName(setObj.storeName || '');
        setContactNumber(setObj.contactNumber || '');
        setWhatsappNumber(setObj.whatsappNumber || '');
        setEmail(setObj.email || '');
        setAddress(setObj.address || '');
        setShippingCharges(setObj.shippingCharges || 0);
        setFreeShippingMinAmount(setObj.freeShippingMinAmount || 0);
        setCodEnabled(setObj.codEnabled !== undefined ? setObj.codEnabled : true);
        setOnlinePaymentEnabled(setObj.onlinePaymentEnabled !== undefined ? setObj.onlinePaymentEnabled : true);
        setTaxPercent(setObj.taxPercent || 0);

        setFacebook(setObj.socialLinks?.facebook || '');
        setInstagram(setObj.socialLinks?.instagram || '');
        setTwitter(setObj.socialLinks?.twitter || '');
        setYoutube(setObj.socialLinks?.youtube || '');
      }
      setLoading(false);
    } catch (err) {
      console.log('Error fetching settings:', err);
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');

      const payload = {
        storeName,
        contactNumber,
        whatsappNumber,
        email,
        address,
        shippingCharges: Number(shippingCharges),
        freeShippingMinAmount: Number(freeShippingMinAmount),
        codEnabled,
        onlinePaymentEnabled,
        taxPercent: Number(taxPercent),
        socialLinks: {
          facebook,
          instagram,
          twitter,
          youtube
        }
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Store configuration settings updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to save settings');
      }
      setSaving(false);
    } catch (err) {
      console.log(err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'white' }}>
        <p style={{ color: 'var(--text-light-muted)' }}>Loading store parameters configurations...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '850px' }}>
      
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-desc">
          <h2>Store Configuration</h2>
          <p>Update support emails, hotlines, WhatsApp routing, shipping rules, and payment toggles.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
          {successMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSettingsSubmit} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Section 1: Basic */}
        <div>
          <h3 style={{ fontSize: '1rem', color: 'white', borderBottom: '1px solid var(--bg-dark-border)', paddingBottom: '6px', marginBottom: '16px', fontFamily: 'Outfit' }}>
            Merchant Information
          </h3>
          <div className="grid grid-2">
            <div className="admin-form-group">
              <label>Store Name</label>
              <input 
                type="text" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Support Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Support Helpline Number</label>
              <input 
                type="text" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>WhatsApp Support Routing Number (No spaces/symbols)</label>
              <input 
                type="text" 
                value={whatsappNumber} 
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="admin-form-control"
                placeholder="e.g. +15551234567"
                required
              />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Corporate Stadium Warehouse Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logistics and Rules */}
        <div>
          <h3 style={{ fontSize: '1rem', color: 'white', borderBottom: '1px solid var(--bg-dark-border)', paddingBottom: '6px', marginBottom: '16px', fontFamily: 'Outfit' }}>
            Logistics & Financial Parameters
          </h3>
          <div className="grid grid-3">
            <div className="admin-form-group">
              <label>Standard Shipping Charge ($)</label>
              <input 
                type="number" 
                value={shippingCharges} 
                onChange={(e) => setShippingCharges(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Free Shipping Threshold ($)</label>
              <input 
                type="number" 
                value={freeShippingMinAmount} 
                onChange={(e) => setFreeShippingMinAmount(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Tax / GST Estimate (%)</label>
              <input 
                type="number" 
                value={taxPercent} 
                onChange={(e) => setTaxPercent(e.target.value)}
                className="admin-form-control"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setCodEnabled(!codEnabled)}
                style={{ color: codEnabled ? 'var(--primary)' : 'var(--text-light-muted)' }}
              >
                {codEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
              <div>
                <span style={{ fontWeight: 600, color: 'white', display: 'block', fontSize: '0.85rem' }}>Cash on Delivery (COD)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>Allow clients to pay in cash upon doorstep delivery.</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setOnlinePaymentEnabled(!onlinePaymentEnabled)}
                style={{ color: onlinePaymentEnabled ? 'var(--primary)' : 'var(--text-light-muted)' }}
              >
                {onlinePaymentEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
              <div>
                <span style={{ fontWeight: 600, color: 'white', display: 'block', fontSize: '0.85rem' }}>Online Payment Gateway</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>Enable Razorpay/Cashfree prepayments gateway integration.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Social Links */}
        <div>
          <h3 style={{ fontSize: '1rem', color: 'white', borderBottom: '1px solid var(--bg-dark-border)', paddingBottom: '6px', marginBottom: '16px', fontFamily: 'Outfit' }}>
            Corporate Social Profiles
          </h3>
          <div className="grid grid-2">
            <div className="admin-form-group">
              <label>Facebook Profile Link</label>
              <input 
                type="text" 
                value={facebook} 
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="admin-form-control"
              />
            </div>
            <div className="admin-form-group">
              <label>Instagram Handle Link</label>
              <input 
                type="text" 
                value={instagram} 
                onChange={(e) => setInstagram(e.target.value)}
                className="admin-form-control"
              />
            </div>
            <div className="admin-form-group">
              <label>Twitter profile handle</label>
              <input 
                type="text" 
                value={twitter} 
                onChange={(e) => setTwitter(e.target.value)}
                className="admin-form-control"
              />
            </div>
            <div className="admin-form-group">
              <label>YouTube Channel Link</label>
              <input 
                type="text" 
                value={youtube} 
                onChange={(e) => setYoutube(e.target.value)}
                className="admin-form-control"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--bg-dark-border)', paddingTop: '20px' }}>
          <button type="submit" className="btn btn-accent btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Configurations'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsManagement;
