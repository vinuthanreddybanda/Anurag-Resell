import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Shield, AlertTriangle, Users, ShoppingBag, Ban, ShieldAlert, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports'); // reports, users, products
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data.reports);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users);
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data.products);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to BAN this user? Banned users cannot log in.')) {
      try {
        await api.post(`/admin/users/${userId}/ban`);
        toast.success('User banned successfully');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Failed to ban user');
      }
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      toast.success('User unbanned successfully');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to unban user');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to DELETE this product listing? This action is permanent.')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div>
      {/* Dashboard header */}
      <div
        className="glass"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
        }}
      >
        <Shield size={36} style={{ color: '#fb7185' }} />
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Admin Moderation Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor report submissions, moderate listings, and manage student accounts.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          <AlertTriangle size={16} />
          Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          <Users size={16} />
          All Users
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          <ShoppingBag size={16} />
          All Products
        </button>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '3px solid rgba(129, 140, 248, 0.1)',
              borderTopColor: '#818cf8',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="glass" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Active User and Product Reports</h2>
              {reports.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Reporter</th>
                        <th>Target Product / User</th>
                        <th>Reason</th>
                        <th>Details</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{report.reporter?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.reporter?.email}</div>
                          </td>
                          <td>
                            {report.reportedProduct ? (
                              <div>
                                <span style={{ color: '#818cf8', fontWeight: 600 }}>[Product]</span> {report.reportedProduct?.title}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Seller: {report.reportedProduct?.seller?.name} ({report.reportedProduct?.seller?.email})
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span style={{ color: '#fb7185', fontWeight: 600 }}>[User]</span> {report.reportedUser?.name}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.reportedUser?.email}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#f43f5e',
                              }}
                            >
                              {report.reason}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {report.description}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {report.reportedProduct && (
                                <button
                                  onClick={() => handleDeleteProduct(report.reportedProduct._id)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete Product"
                                  style={{ padding: '0.4rem' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              
                              {/* Option to Ban reported user/seller */}
                              {report.reportedProduct?.seller ? (
                                !report.reportedProduct.seller.isBanned && (
                                  <button
                                    onClick={() => handleBanUser(report.reportedProduct.seller._id)}
                                    className="btn btn-danger btn-sm"
                                    title="Ban Seller"
                                    style={{ padding: '0.4rem', backgroundColor: '#e11d48' }}
                                  >
                                    <Ban size={14} />
                                  </button>
                                )
                              ) : (
                                report.reportedUser && !report.reportedUser.isBanned && (
                                  <button
                                    onClick={() => handleBanUser(report.reportedUser._id)}
                                    className="btn btn-danger btn-sm"
                                    title="Ban User"
                                    style={{ padding: '0.4rem', backgroundColor: '#e11d48' }}
                                  >
                                    <Ban size={14} />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No reports submitted yet.
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Registered Users</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Institution</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>Anurag University</td>
                        <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: u.role === 'admin' ? '#c084fc' : 'var(--text-secondary)' }}>
                          {u.role}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: u.isBanned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: u.isBanned ? '#fb7185' : '#34d399',
                            }}
                          >
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            u.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(u._id)}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <ShieldAlert size={14} style={{ color: '#34d399' }} />
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(u._id)}
                                className="btn btn-danger btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Ban size={14} />
                                Ban
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Active Marketplace Listings</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Seller</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>
                          <div>{p.seller?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.seller?.email}</div>
                        </td>
                        <td>{p.category}</td>
                        <td style={{ fontWeight: 700, color: '#818cf8' }}>₹{p.price.toFixed(2)}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: p.isSold ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: p.isSold ? '#fb7185' : '#34d399',
                            }}
                          >
                            {p.isSold ? 'Sold' : 'Available'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="btn btn-danger btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
