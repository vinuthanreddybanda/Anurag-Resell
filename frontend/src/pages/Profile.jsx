import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Edit3, Save, X, PlusCircle, Briefcase, GraduationCap, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [myProducts, setMyProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await api.get('/users/my-products');
        setMyProducts(res.data.products);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch your listings');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMyProducts();
    
    // Set initial form values
    if (user) {
      setName(user.name || '');
    }
  }, [user, toast]);



  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);

      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setName(user.name);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
      
      {/* Profile Sidebar */}
      <div>
        <div className="glass profile-card" style={{ boxShadow: 'var(--shadow-md)' }}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ width: '100%' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <User size={48} style={{ color: '#818cf8' }} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'left' }}>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>


              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <User size={48} style={{ color: '#818cf8' }} />
              </div>
              <h3 className="profile-name">{user.name}</h3>
              <p className="profile-email">
                <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                {user.email}
              </p>

              <div className="profile-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <Briefcase size={12} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Institution
                  </span>
                  <span className="profile-info-val">Anurag University</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary btn-full btn-sm"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Main / Listed items */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Listed Products</h2>
          <Link to="/create-product" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            Post New Product
          </Link>
        </div>

        {productsLoading ? (
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
        ) : myProducts.length > 0 ? (
          <div className="grid-marketplace">
            {myProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div
            className="glass"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>You haven't listed any items yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Have items lying around your dorm? List them here to sell to other students!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
