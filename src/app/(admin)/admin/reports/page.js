'use client';

import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, TrendingUp, BarChart, DollarSign } from 'lucide-react';
import { formatINR } from 'src/lib/currency';

const ReportsManagement = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory or revenue

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch all products for complete stock valuations
      const prodRes = await fetch('/api/products?adminView=true');
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      setLoading(false);
    } catch (err) {
      console.log('Error loading reports details:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'white' }}>
        <p style={{ color: 'var(--text-light-muted)' }}>Loading financial ledger logs & inventory stock books...</p>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalOrders = 0,
    cancelledOrders = 0,
    bestSellingProducts = [],
    salesChartData = []
  } = stats || {};

  // Inventory calculations
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockList = products.filter(p => p.stock <= 5);

  return (
    <div className="animate-fade">
      
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-desc">
          <h2>Financial Reports</h2>
          <p>Analyze inventory stock valuations, sales margins, and product sales statistics.</p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="tabs-nav" style={{ borderColor: 'var(--bg-dark-border)', marginBottom: '24px' }}>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          style={{ color: 'white', borderBottomColor: activeTab === 'inventory' ? 'var(--primary)' : 'transparent' }}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Valuation
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          style={{ color: 'white', borderBottomColor: activeTab === 'revenue' ? 'var(--primary)' : 'transparent' }}
          onClick={() => setActiveTab('revenue')}
        >
          Sales Ledger & Revenues
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="animate-fade">
          {/* Quick Metrics */}
          <div className="admin-kpi-grid">
            <div className="admin-card kpi-card">
              <div className="kpi-icon-box"><FileText /></div>
              <div className="kpi-info">
                <h4>Stock Valuation</h4>
                <span className="kpi-value">{formatINR(totalStockValuation)}</span>
              </div>
            </div>
            <div className="admin-card kpi-card">
              <div className="kpi-icon-box"><BarChart /></div>
              <div className="kpi-info">
                <h4>Total Items Count</h4>
                <span className="kpi-value">{totalStockCount} units</span>
              </div>
            </div>
            <div className="admin-card kpi-card" style={{ borderLeft: lowStockList.length > 0 ? '3px solid var(--danger)' : '' }}>
              <div className="kpi-icon-box" style={{ color: lowStockList.length > 0 ? 'var(--danger)' : '' }}><AlertTriangle /></div>
              <div className="kpi-info">
                <h4>Out of Stock Alert</h4>
                <span className="kpi-value" style={{ color: lowStockList.length > 0 ? 'var(--danger)' : '' }}>{lowStockList.length} items</span>
              </div>
            </div>
          </div>

          {/* Low Stock Warning List */}
          {lowStockList.length > 0 && (
            <div className="admin-card" style={{ border: '1px solid var(--danger)', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
                <AlertTriangle size={18} /> CRITICAL LOW STOCK WARNINGS
              </h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Stock Quantity</th>
                      <th>Required Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockList.map(p => (
                      <tr key={p._id}>
                        <td style={{ color: 'white', fontWeight: 700 }}>{p.sku}</td>
                        <td>{p.name}</td>
                        <td>{p.category.replace('-', ' ')}</td>
                        <td>{formatINR(p.price)}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{p.stock} units</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>Reorder stock immediately</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valuation table */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white', marginBottom: '20px' }}>
              Full Stock Valuation Matrix
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Item</th>
                    <th>Price</th>
                    <th>MRP</th>
                    <th>Stock Qty</th>
                    <th>Inventory Asset Value</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 700, color: 'white' }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{formatINR(p.price)}</td>
                      <td>{formatINR(p.mrp)}</td>
                      <td>{p.stock} units</td>
                      <td style={{ fontWeight: 700, color: 'white' }}>{formatINR(p.price * p.stock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === 'revenue' && (
        <div className="animate-fade">
          {/* Quick Metrics */}
          <div className="admin-kpi-grid">
            <div className="admin-card kpi-card volt-glow">
              <div className="kpi-icon-box"><DollarSign /></div>
              <div className="kpi-info">
                <h4>Total Revenue</h4>
                <span className="kpi-value">{formatINR(totalRevenue)}</span>
              </div>
            </div>
            <div className="admin-card kpi-card">
              <div className="kpi-icon-box"><TrendingUp /></div>
              <div className="kpi-info">
                <h4>Order Count</h4>
                <span className="kpi-value">{totalOrders} orders</span>
              </div>
            </div>
            <div className="admin-card kpi-card">
              <div className="kpi-icon-box"><AlertTriangle /></div>
              <div className="kpi-info">
                <h4>Cancelled Orders</h4>
                <span className="kpi-value">{cancelledOrders} orders</span>
              </div>
            </div>
          </div>

          {/* Month on month table */}
          <div className="admin-card" style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white', marginBottom: '20px' }}>
              Monthly Sales Revenues Logs
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reporting Month</th>
                    <th>Total Completed Orders</th>
                    <th>Gross Invoice Revenue</th>
                    <th>Estimated Tax Margin (12%)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesChartData.map(item => (
                    <tr key={item.name}>
                      <td style={{ color: 'white', fontWeight: 600 }}>{item.name}</td>
                      <td>{item.orders} orders completed</td>
                      <td style={{ fontWeight: 700, color: 'white' }}>{formatINR(item.sales)}</td>
                      <td>{formatINR(Math.round(item.sales * 0.12))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best selling details */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white', marginBottom: '20px' }}>
              Product Sales margins list
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Name</th>
                    <th>Average Unit Price</th>
                    <th>Units Sold</th>
                    <th>Gross Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellingProducts.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 700, color: 'white' }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{formatINR(p.price)}</td>
                      <td>{p.salesCount} units</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsManagement;
