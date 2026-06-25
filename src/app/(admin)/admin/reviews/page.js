'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, MessageSquare, Star, ArrowRight } from 'lucide-react';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // To display all reviews for admin moderation, we can create an admin reviews GET endpoint,
      // or fetch all reviews from DB.
      // Wait, we can write a simple endpoint /api/admin/reviews/route.js, or reuse /api/reviews
      // Let's check: our /api/reviews route handles GET reviews with ?productId, but what about GET all reviews for admin?
      // Let's create `/api/admin/reviews/route.js` GET handler which fetches all reviews! That's clean and safe!
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
      setLoading(false);
    } catch (err) {
      console.log('Error loading admin reviews:', err);
      setLoading(false);
    }
  };

  const handleApprove = async (rev, approveStatus) => {
    try {
      const res = await fetch(`/api/reviews/${rev._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approveStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.error || 'Failed to update review status');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (revId) => {
    if (!confirm('Are you sure you want to delete this customer feedback?')) return;

    try {
      const res = await fetch(`/api/reviews/${revId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenReplyModal = (rev) => {
    setActiveReview(rev);
    setReplyText(rev.reply || '');
    setShowReplyModal(true);
  };

  const handleSendReplySubmit = async (e) => {
    e.preventDefault();
    if (!activeReview) return;

    try {
      const res = await fetch(`/api/reviews/${activeReview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await res.json();
      
      if (data.success) {
        setShowReplyModal(false);
        fetchReviews();
      } else {
        alert(data.error || 'Failed to send reply');
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
          <h2>Player Feedback Moderation</h2>
          <p>Approve genuine ratings, suspends fake spam reviews, and write merchant replies.</p>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light-muted)' }}>Loading review logs...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Author</th>
                <th>Rating</th>
                <th>Comment Review</th>
                <th>Approval</th>
                <th>Merchant Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(rev => (
                <tr key={rev._id}>
                  <td style={{ color: 'white', fontWeight: 600 }}>
                    {/* Shows product name matching ID locally if possible or SKU */}
                    <span style={{ fontSize: '0.85rem' }}>ID: {String(rev.product).substring(18)}</span>
                  </td>
                  <td>
                    <strong>{rev.userName}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>{rev.userEmail}</span>
                  </td>
                  <td>
                    <div style={{ color: '#F59E0B', fontSize: '0.8rem', display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? '#F59E0B' : 'transparent'} stroke="#F59E0B" />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rev.comment}>
                    {rev.comment}
                  </td>
                  <td>
                    {rev.isApproved ? (
                      <span className="status-badge success">Approved</span>
                    ) : (
                      <span className="status-badge pending">Awaiting</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rev.reply || <span style={{ color: 'var(--text-light-muted)' }}>No response written</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      {!rev.isApproved ? (
                        <button 
                          type="button" 
                          className="action-btn edit" 
                          style={{ color: 'var(--success)' }}
                          onClick={() => handleApprove(rev, true)}
                          title="Approve Review"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          className="action-btn" 
                          style={{ color: 'var(--text-light-muted)' }}
                          onClick={() => handleApprove(rev, false)}
                          title="Unapprove / Suspend Review"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button 
                        type="button" 
                        className="action-btn" 
                        onClick={() => handleOpenReplyModal(rev)}
                        title="Write Response Reply"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="action-btn delete" 
                        onClick={() => handleDelete(rev._id)}
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light-muted)' }}>
                    No reviews awaiting moderation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPLY MODAL */}
      {showReplyModal && activeReview && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animate-slide-up" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3>Merchant Reply</h3>
              <button type="button" onClick={() => setShowReplyModal(false)} style={{ color: 'white' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSendReplySubmit} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '4px', borderLeft: '3px solid var(--primary)', fontSize: '0.85rem' }}>
                <strong>{activeReview.userName} wrote:</strong>
                <p style={{ fontStyle: 'italic', marginTop: '4px', color: 'var(--text-light-muted)' }}>"{activeReview.comment}"</p>
              </div>
              <div className="admin-form-group">
                <label>Merchant Response Message</label>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="e.g. Thank you for your feedback! Glad you liked the bat ping..."
                  rows={4}
                  className="admin-form-control"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Send Response <ArrowRight size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewsManagement;
