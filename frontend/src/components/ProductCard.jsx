import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, User } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { _id, title, price, category, images, isSold, createdAt, seller } = product;

  // Use proxy path directly (Vite proxy forwards /uploads to backend)
  const displayImage = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500';

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link to={`/products/${_id}`} className="card">
      <div className="card-image-wrapper">
        <img src={displayImage} alt={title} className="card-image" loading="lazy" />
        <span
          className={`card-tag ${isSold ? 'badge-sold' : 'badge-available'}`}
          style={{
            backgroundColor: isSold ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            color: 'white',
          }}
        >
          {isSold ? 'Sold' : 'Available'}
        </span>
      </div>
      
      <div className="card-body">
        <div className="card-price">₹{price.toFixed(2)}</div>
        <h3 className="card-title">{title}</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span
            className="badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
            }}
          >
            <Tag size={12} />
            {category}
          </span>
        </div>

        <div className="card-footer">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <User size={12} />
            {seller ? seller.name : 'Unknown Seller'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} />
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
