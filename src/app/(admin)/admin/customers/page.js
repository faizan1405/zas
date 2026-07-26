'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserCheck, ShieldAlert, Shield } from 'lucide-react';

const DEBOUNCE_MS = 400;

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [displaySearch, setDisplaySearch] = useState('');
  const debounceRef = useRef(null);

  const fetchCustomers = useCallback(async (query) => {
    try {
      setLoading(true);
      let url = '/api/admin/customers';
      if (query) url += `?search=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(data.customers);
      } else {
        setCustomers([]);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error loading customer list:', err);
      setLoading(false);
    }
  }, []);

  // Debounced search: update display immediately, fetch after delay
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setDisplaySearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    fetchCustomers(search);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchCustomers]);

  const handleToggleBlock = async (cust) => {
    const action = cust.isBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} user account '${cust.name}'?`)) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cust._id,
          isBlocked: !cust.isBlocked
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchCustomers();
      } else {
        alert(data.error || `Failed to ${action} customer`);
      }
    } catch (err) {
      console.log('Error updating block status:', err);
    }
  };

  return (
    <div className="animate-fade">
      
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-desc">
          <h2>Registered Customers</h2>
          <p>Monitor user registration logs, saved shipping address counts, and suspend accounts if necessary.</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="admin-card table-filter-row" style={{ backgroundColor: 'var(--bg-dark-card)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Search size={16} style={{ color: 'var(--text-light-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={displaySearch}
            onChange={handleSearchChange}
            className="admin-search-input"
            style={{ width: '320px' }}
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light-muted)' }}>Loading player profiles...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Registered Date</th>
                <th>Saved Addresses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(cust => (
                <tr key={cust._id}>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'white' }}>{cust.name}</span>
                    </div>
                  </td>
                  <td>{cust.email}</td>
                  <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>
                    {cust.addresses?.length || 0} Saved
                  </td>
                  <td>
                    {cust.isBlocked ? (
                      <span className="status-badge failed">Suspended</span>
                    ) : (
                      <span className="status-badge success">Active</span>
                    )}
                  </td>
                  <td>
                    <button 
                      type="button" 
                      className={`btn btn-sm ${cust.isBlocked ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleToggleBlock(cust)}
                    >
                      {cust.isBlocked ? (
                        <>
                          <UserCheck size={12} /> Activate Account
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={12} /> Suspend Account
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light-muted)' }}>
                    No registered customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default CustomersManagement;
