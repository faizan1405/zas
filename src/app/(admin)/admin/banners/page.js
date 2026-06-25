'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';

const BannersManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/shop');
  const [type, setType] = useState('hero'); // hero or offer
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners?adminView=true');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error loading banners:', err);
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImage('');
    setLink('/shop');
    setType('hero');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingId(banner._id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImage(banner.image);
    setLink(banner.link || '/shop');
    setType(banner.type || 'hero');
    setDisplayOrder(banner.displayOrder || 0);
    setIsActive(banner.isActive !== undefined ? banner.isActive : true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.url) {
        setImage(data.url);
      } else {
        setErrorMsg(data.error || 'Upload failed');
      }
      setUploading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error uploading image.');
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) return;

    setErrorMsg('');
    const payload = {
      title,
      subtitle,
      image,
      link,
      type,
      displayOrder: Number(displayOrder),
      isActive
    };

    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        fetchBanners();
      } else {
        setErrorMsg(data.error || 'Failed to save banner');
      }
    } catch (err) {
      console.log(err);
      setErrorMsg('Network error saving details.');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;

    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBanners();
      } else {
        alert(data.error || 'Failed to delete banner');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="animate-fade">
      
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-desc">
          <h2>Carousel & Offer Banners</h2>
          <p>Configure homepage hero sliders and marketing banners display links.</p>
        </div>
        <button 
          type="button" 
          className="btn btn-accent btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={handleOpenAddModal}
        >
          <Plus size={16} /> Create Banner
        </button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light-muted)' }}>Loading banners...</p>
      ) : (
        <div className="grid grid-2 animate-fade">
          {banners.map(banner => (
            <div 
              key={banner._id} 
              className="admin-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {/* Image banner preview */}
              <div style={{ width: '100%', height: '180px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--bg-dark-border)', position: 'relative' }}>
                <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span 
                  className={`status-badge ${banner.type === 'hero' ? 'info' : 'warning'}`} 
                  style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}
                >
                  {banner.type.toUpperCase()}
                </span>
                {!banner.isActive && (
                  <span 
                    className="status-badge muted" 
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}
                  >
                    Inactive
                  </span>
                )}
              </div>

              <div>
                <h4 style={{ color: 'white', fontFamily: 'Outfit', fontSize: '1.1rem' }}>{banner.title}</h4>
                <p style={{ color: 'var(--text-light-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{banner.subtitle}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)', display: 'block', marginTop: '6px' }}>
                  <strong>Link:</strong> {banner.link} | <strong>Priority:</strong> #{banner.displayOrder}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid var(--bg-dark-border)', paddingTop: '15px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleOpenEditModal(banner)}
                >
                  <Edit size={12} /> Edit Banner
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm text-white"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleDeleteBanner(banner._id)}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <p style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-light-muted)', padding: '30px' }}>
              No homepage banners uploaded.
            </p>
          )}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animate-slide-up" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Promo Banner' : 'Create Promo Banner'}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ color: 'white' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {errorMsg && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Banner Header Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Banner Subtitle / Tagline</label>
                  <input 
                    type="text" 
                    value={subtitle} 
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="admin-form-control"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Promo Action Link Path</label>
                  <input 
                    type="text" 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. /shop?category=cricket-bats"
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Banner Type Section</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="admin-select"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <option value="hero">Top Main Hero Carousel Slider</option>
                    <option value="offer">Middle Homepage Offer Banner Card</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Display Priority Order</label>
                  <input 
                    type="number" 
                    value={displayOrder} 
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                {/* Banner Image Upload */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Banner Media File</span>
                    <span>{uploading ? 'Uploading...' : ''}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="btn btn-secondary btn-sm" style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
                      <Upload size={14} /> Upload Banner Media
                      <input 
                        type="file" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                      />
                    </label>
                  </div>
                  {image && (
                    <div style={{ width: '100%', height: '140px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--bg-dark-border)' }}>
                      <img src={image} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="filter-checkbox-item" style={{ color: 'white' }}>
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active Display / Publish</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent btn-sm">
                  {editingId ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BannersManagement;
