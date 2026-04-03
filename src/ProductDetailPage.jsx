import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import API_BASE from './api';

export default function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const product  = location.state?.product;
  const category = location.state?.category || 'Mobiles';

  const [selectedImage, setSelectedImage] = useState(0);
  const [username, setUsername]           = useState('');
  const [cartCount, setCartCount]         = useState(0);
  const [adding, setAdding]               = useState(false);
  const [addedMsg, setAddedMsg]           = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/auth/session`, { credentials: 'include' });
        const data = await res.json();
        setUsername(data.username || '');
        if (data.username) {
          const cRes  = await fetch(`${API_BASE}/api/cart/items/count?username=${data.username}`, { credentials: 'include' });
          const count = await cRes.json();
          setCartCount(count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!product) navigate('/customerhome');
  }, [product]);

  if (!product) return null;

  const images  = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/400'];
  const fmt     = (num) => parseFloat(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const inStock = product.stock > 0;

  const handleAddToCart = async () => {
    if (!username) { navigate('/'); return; }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, productId: product.product_id, quantity: 1 }),
      });
      if (res.ok) {
        setCartCount(prev => prev + 1);
        setAddedMsg('Added to cart!');
        setTimeout(() => setAddedMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="pd-page">
      <Header cartCount={cartCount} username={username} />

      <main className="pd-main">
        <button
          className="back-button"
          onClick={() => navigate('/customerhome', { state: { selectedCategory: category } })}
        >
          ← Back to {category}
        </button>

        <div className="pd-layout">

          <div className="pd-images">
            <div className="pd-main-img-wrap">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="pd-main-img"
                onError={e => { e.target.src = 'https://via.placeholder.com/400'; }}
              />
            </div>

            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${selectedImage === i ? 'pd-thumb-active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt=""
                      onError={e => { e.target.src = 'https://via.placeholder.com/60'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pd-details">
            <div className="pd-category-tag">{category}</div>
            <h1 className="pd-name">{product.name}</h1>
            <div className="pd-price">₹{fmt(product.price)}</div>

            <div className="pd-stock">
              <span className={`pd-stock-dot ${inStock ? 'pd-stock-dot-in' : 'pd-stock-dot-out'}`} />
              <span className={`pd-stock-text ${inStock ? 'pd-stock-text-in' : 'pd-stock-text-out'}`}>
                {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <div className="pd-divider" />

            <div className="pd-desc-block">
              <div className="pd-section-label">Description</div>
              <p className="pd-description">{product.description}</p>
            </div>

            <div className="pd-divider" />

            {inStock && (
              <div className="pd-actions">
                <button
                  className={`pd-add-btn ${adding ? 'pd-add-btn-loading' : ''}`}
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                {addedMsg && (
                  <div className="pd-toast">
                    <div className="pd-toast-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="pd-toast-text">Added to cart!</div>
                      <div className="pd-toast-sub">{product.name}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!inStock && (
              <div className="pd-out-of-stock">
                This product is currently out of stock.
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}