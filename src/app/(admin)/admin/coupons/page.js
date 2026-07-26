'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Ticket } from 'lucide-react';
import { formatINR } from 'src/lib/currency';

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // percentage or fixed
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [isActive, setIsActive] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error loading coupons:', err);
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderValue(0);
    
    // Set default expiry date to 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setExpiryDate(nextMonth.toISOString().split('T')[0]);

    setUsageLimit(100);
    setIsActive(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderValue(coupon.minOrderValue || 0);
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    setUsageLimit(coupon.usageLimit || 100);
    setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!code || discountValue === undefined || !expiryDate) return;

    setErrorMsg('');
    const payload = {
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      expiryDate,
      usageLimit: Number(usageLimit),
      isActive
    };

    try {
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        fetchCoupons();
      } else {
        setErrorMsg(data.error || 'Failed to save coupon code');
      }
    } catch (err) {
      console.log(err);
      setErrorMsg('Network error saving coupon code details.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this promo coupon code?')) return;

    try {
      const res = await fetch(`/api/coupons/${couponId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCoupons();
      } else {
        alert(data.error || 'Failed to delete coupon code');
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
          <h2>Promo Coupon Codes</h2>
          <p>Create percentage discounts or flat fee deductions to drive client checkouts.</p>
        </div>
        <button 
          type="button" 
          className="btn btn-accent btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={handleOpenAddModal}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light-muted)' }}>Loading coupons list...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Details</th>
                <th>Min Purchase</th>
                <th>Expiry Date</th>
                <th>Usage Limit</th>
                <th>Used Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Ticket size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 800, color: 'white', letterSpacing: '0.02em' }}>{coupon.code}</span>
                    </div>
                  </td>
                  <td style={{ color: 'white', fontWeight: 600 }}>
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}% Off` 
                      : `₹${coupon.discountValue} Flat Discount`}
                  </td>
                  <td>{formatINR(coupon.minOrderValue || 0)}</td>
                  <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td>{coupon.usageLimit || 100} max</td>
                  <td style={{ fontWeight: 700, color: 'white' }}>{coupon.usedCount || 0} times</td>
                  <td>
                    {coupon.isActive ? (
                      <span className="status-badge success">Active</span>
                    ) : (
                      <span className="status-badge muted">Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button 
                        type="button" 
                        className="action-btn edit" 
                        onClick={() => handleOpenEditModal(coupon)}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="action-btn delete" 
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light-muted)' }}>
                    No promo coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animate-slide-up" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Coupon Code' : 'Create Coupon Code'}</h3>
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
                  <label>Promo Code Text (e.g. APEX20)</label>
                  <input 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)}
                    className="admin-form-control"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Discount Value Type</label>
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="admin-select"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <option value="percentage">Percentage discount (%)</option>
                    <option value="fixed">Fixed Flat discount (₹)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Discount Amount / Value</label>
                  <input 
                    type="number" 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Minimum Purchase Required (₹)</label>
                  <input 
                    type="number" 
                    value={minOrderValue} 
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Max Usage Limit (Times)</label>
                  <input 
                    type="number" 
                    value={usageLimit} 
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="admin-form-control"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="filter-checkbox-item" style={{ color: 'white' }}>
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active / Enable Coupon</span>
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
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CouponsManagement;
