import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Loader } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const toast = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search;
      if (category !== 'All') params.category = category;
      params.sort = sort;

      const res = await api.get('/products', { params });
      setProducts(res.data.products);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, toast]);

  useEffect(() => {
    // Debounce search requests slightly
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchProducts]);

  const categories = ['All', 'Books', 'Electronics', 'Cycles', 'Furniture', 'Others'];

  return (
    <div>
      {/* Hero section */}
      <div
        className="glass"
        style={{
          padding: '2.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(17, 24, 39, 0.8) 100%)',
          border: '1px solid rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Anurag University Marketplace
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Buy and sell items securely with fellow Anurag students. Simple, fast, and exclusive to @anurag.edu.in emails.
        </p>
      </div>

      {/* Toolbar / Search, Filter, Sort */}
      <div className="glass market-toolbar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '0.5rem 2rem 0.5rem 1rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <select
            className="form-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: '0.5rem 2rem 0.5rem 1rem' }}
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader size={36} style={{ color: '#818cf8', animation: 'spin 2s linear infinite' }} />
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      ) : products.length > 0 ? (
        <div className="grid-marketplace">
          {products.map((product) => (
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
          <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>No listed products found.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Try adjusting your search criteria or browse another category.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
