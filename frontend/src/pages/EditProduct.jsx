import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Save, Upload, X, ArrowLeft } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [isSold, setIsSold] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const { product } = res.data;
        setTitle(product.title);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setIsSold(product.isSold);
        setPreviews(product.images || []);
      } catch (err) {
        toast.error(err.message || 'Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, toast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate previews for the newly selected images
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...filePreviews]);
  };

  const removeImage = (index) => {
    // If it's a new file upload, remove it from the images array
    // Count how many existing image URLs are before this index
    const newImages = [...images];
    
    // We can just clear all and let the user select replacement images.
    // To keep it simple and robust, let's allow them to upload replacement images.
    const updatedPreviews = previews.filter((_, idx) => idx !== index);
    setPreviews(updatedPreviews);
    
    // If it was a newly uploaded file
    const newUploadIdx = index - (previews.length - images.length);
    if (newUploadIdx >= 0) {
      newImages.splice(newUploadIdx, 1);
      setImages(newImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      toast.error('Please fill in all details');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('isSold', isSold);

      // Append new image files if any
      if (images.length > 0) {
        images.forEach((img) => {
          formData.append('images', img);
        });
      }

      await api.patch(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Product updated successfully!');
      navigate(`/products/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
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

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="glass" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Edit Listing</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Update the listing attributes or toggle availability status.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Title</label>
            <input
              type="text"
              className="form-control"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none' }}
              required
            />
          </div>

          {/* Mark as Sold check */}
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <input
              type="checkbox"
              id="isSoldCheck"
              checked={isSold}
              onChange={(e) => setIsSold(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isSoldCheck" style={{ fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Mark this product as Sold
            </label>
          </div>

          {/* Image Upload Area */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Replace Photos (Optional - leaves current photos if blank)</label>
            
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
                  <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Upload</span>
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
            {submitting ? 'Saving changes...' : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
