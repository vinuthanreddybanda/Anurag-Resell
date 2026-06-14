import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Upload, X, Plus } from 'lucide-react';

const CreateProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Enforce up to 5 images
    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create file object previews
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...filePreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, idx) => idx !== index);
    const updatedPreviews = previews.filter((_, idx) => idx !== index);
    
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      toast.error('Please fill in all details');
      return;
    }

    if (images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      
      images.forEach((img) => {
        formData.append('images', img);
      });

      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Product listing created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to list product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="glass" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>List an Item</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Describe your product and add high quality photos for campus buyers.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Organic Chemistry Textbook, Calculus 3rd Ed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (INR)</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="form-control"
                  placeholder="500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ paddingLeft: '2.25rem', width: '100%' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Cycles">Cycles</option>
                <option value="Furniture">Furniture</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Provide item specifics, condition, and meet-up preferences (e.g. library, dorm)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
              required
            />
          </div>

          {/* Image Upload Area */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Photos (Up to 5)</label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="glass"
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {previews.length < 5 && (
                <label
                  className="glass"
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'var(--text-secondary)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#818cf8')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                >
                  <Upload size={20} />
                  <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Creating Listing...' : (
              <>
                <Plus size={18} />
                Create Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
