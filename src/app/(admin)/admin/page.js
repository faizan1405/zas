'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { formatINR } from 'src/lib/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (res.ok && data.success && data.stats) {
          setStats(data.stats);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'white' }}>
        <p style={{ color: 'var(--text-light-muted)' }}>Aggregating accounting books & product stock levels...</p>
      </div>
    );
  }

  const {
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    recentOrders = [],
    bestSellingProducts = [],
    salesChartData = []
  } = stats || {};

  // Custom SVG Chart builder math
  const maxSalesVal = Math.max(...salesChartData.map(d => d.sales), 100);

  return (
    <div className="animate-fade">
      {/* Page Title */}
      <div className="admin-header-row">
        <div className="admin-title-desc">
          <h2>Console Dashboard</h2>
          <p>Real-time metrics overview of Apex Cricket store performance.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-card kpi-card volt-glow">
          <div className="kpi-icon-box"><DollarSign /></div>
          <div className="kpi-info">
            <h4>Total Revenue</h4>
            <span className="kpi-value">{formatINR(totalRevenue)}</span>
          </div>
        </div>
        <div className="admin-card kpi-card">
          <div className="kpi-icon-box"><ShoppingCart /></div>
          <div className="kpi-info">
            <h4>Total Orders</h4>
            <span className="kpi-value">{totalOrders}</span>
          </div>
        </div>
        <div className="admin-card kpi-card">
          <div className="kpi-icon-box"><Users /></div>
          <div className="kpi-info">
            <h4>Total Customers</h4>
            <span className="kpi-value">{totalCustomers}</span>
          </div>
        </div>
        <div className="admin-card kpi-card" style={{ borderLeft: lowStockProducts > 0 ? '3px solid var(--danger)' : '' }}>
          <div className="kpi-icon-box" style={{ color: lowStockProducts > 0 ? 'var(--danger)' : '' }}><AlertTriangle /></div>
          <div className="kpi-info">
            <h4>Low Stock Items</h4>
            <span className="kpi-value" style={{ color: lowStockProducts > 0 ? 'var(--danger)' : '' }}>{lowStockProducts}</span>
          </div>
        </div>
      </div>

      {/* 2. SVG sales Chart & Best sellers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* SVG Chart */}
        <div className="admin-card chart-box">
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} /> Sales Performance (Month-on-Month)
          </h3>
          <svg className="admin-chart-svg" viewBox="0 0 500 220">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="40" y2="180" className="chart-axis-line" />
            <line x1="40" y1="180" x2="480" y2="180" className="chart-axis-line" />
            
            <line x1="40" y1="60" x2="480" y2="60" className="chart-grid-line" />
            <line x1="40" y1="120" x2="480" y2="120" className="chart-grid-line" />

            {/* Bars rendering */}
            {salesChartData.map((d, idx) => {
              const xPos = 60 + idx * 70;
              const barHeight = (d.sales / maxSalesVal) * 130;
              const yPos = 180 - barHeight;

              return (
                <g key={d.name}>
                  {/* Tooltip trigger bar */}
                  <rect 
                    x={xPos} 
                    y={yPos} 
                    width="32" 
                    height={barHeight} 
                    className="chart-bar" 
                    rx="2"
                  />
                  {/* Value text labels */}
                  <text 
                    x={xPos + 16} 
                    y={yPos - 6} 
                    className="chart-text" 
                    textAnchor="middle" 
                    style={{ fontSize: '8px', fill: 'white' }}
                  >
                    {formatINR(d.sales)}
                  </text>
                  {/* Month text label */}
                  <text 
                    x={xPos + 16} 
                    y="196" 
                    className="chart-text" 
                    textAnchor="middle"
                  >
                    {d.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Best sellers */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white', marginBottom: '20px' }}>
            Best Selling Products
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {bestSellingProducts.map((p, idx) => (
              <div key={p._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid var(--bg-dark-border)', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                  {idx + 1}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>SKU: {p.sku} | sales: {p.salesCount} items</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{formatINR(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Recent orders list */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'white' }}>
            Recent Orders Activity
          </h3>
          <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Receiver Name</th>
                <th>Date Placed</th>
                <th>Total Price</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Shipment Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <Link href={`/admin/orders?search=${order.orderId}`} style={{ fontWeight: 700, color: 'white', textDecoration: 'underline' }}>
                      {order.orderId}
                    </Link>
                  </td>
                  <td>{order.shippingAddress.fullName}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700, color: 'white' }}>{formatINR(order.totalAmount)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'failed' : 'pending'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.orderStatus === 'Delivered' ? 'success' : order.orderStatus === 'Cancelled' ? 'failed' : 'pending'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light-muted)' }}>
                    <Clock size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                    No orders placed in this store yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
