import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Edit, Trash2, Flag, AlertTriangle, ChevronLeft, User } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Reporting Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        if (res.data.product.images && res.data.product.images.length > 0) {
          setActiveImage(res.data.product.images[0]);
        }
      } catch (err) {
        toast.error(err.message || 'Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleContactSeller = async () => {
    if (!user) {
      toast.info('Please log in to contact the seller');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post('/chats', { productId: product._id });
      navigate('/chats', { state: { activeChatId: res.data.chat._id } });
    } catch (err) {
      toast.error(err.message || 'Could not start chat');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/products/${product._id}`);
        toast.success('Listing deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error(err.message || 'Delete failed');
      }
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      toast.error('Please describe your report details');
      return;
    }

    setSubmittingReport(true);
    try {
      await api.post('/reports', {
        reportedProduct: product._id,
        reportedUser: product.seller._id,
        reason: reportReason,
        description: reportDescription,
      });
      toast.success('Product reported successfully. Administrators will review it.');
      setShowReportModal(false);
      setReportDescription('');
    } catch (err) {
      toast.error(err.message || 'Could not submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(129, 140, 248, 0.1)',
            borderTopColor: '#818cf8',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) return null;

  const isOwner = user && user._id === product.seller._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        <ChevronLeft size={16} />
        Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Images Column */}
        <div>
          <div
            className="glass"
            style={{
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              aspectRatio: '4/3',
              marginBottom: '1rem',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className="glass"
                  style={{
                    width: '60px',
                    height: '60px',
                    padding: 0,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid #818cf8' : '1px solid var(--border)',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {product.category}
              </span>

              <span
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: product.isSold ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: product.isSold ? '#ef4444' : '#10b981',
                }}
              >
                {product.isSold ? 'Sold' : 'Available'}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', lineHeight: '1.2' }}>
              {product.title}
            </h1>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', marginTop: '0.5rem' }}>
              ₹{product.price.toFixed(2)}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Description
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {product.description}
            </p>
          </div>

          {/* Seller Card */}
          <div className="glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.seller.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Anurag University Student
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {isOwner ? (
              <>
                <Link to={`/products/${product._id}/edit`} className="btn btn-primary" style={{ flex: 1 }}>
                  <Edit size={18} />
                  Edit Listing
                </Link>
                <button onClick={handleDelete} className="btn btn-danger">
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleContactSeller}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={product.isSold}
                >
                  <MessageSquare size={18} />
                  {product.isSold ? 'Sold' : 'Contact Seller'}
                </button>

                {user && (
                  <button onClick={() => setShowReportModal(true)} className="btn btn-secondary">
                    <Flag size={18} style={{ color: '#fb7185' }} />
                    Report
                  </button>
                )}
              </>
            )}

            {isAdmin && !isOwner && (
              <button onClick={handleDelete} className="btn btn-danger" style={{ flex: '0 0 auto' }}>
                <Trash2 size={18} />
                Admin Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="glass"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2rem',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fb7185' }}>
              <AlertTriangle size={20} />
              Report Inappropriate Content
            </h3>
            
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select
                  className="form-control"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam">Spam</option>
                  <option value="Fake Product">Fake Product</option>
                  <option value="Offensive Content">Offensive Content</option>
                  <option value="Fraud">Fraud</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain why this content violates university marketplace rules..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  disabled={submittingReport}
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
