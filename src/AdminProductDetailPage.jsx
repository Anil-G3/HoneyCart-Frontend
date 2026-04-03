import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from './Footer';
import Logo from './Logo';
import API_BASE from './api';

export default function AdminProductDetailPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const product  = location.state?.product;
  const category = location.state?.category || 'Mobiles';
  const scrollY  = location.state?.scrollY  || 0;

  const [selectedImage, setSelectedImage] = useState(0);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (!product) navigate('/admindashboard'); }, [product]);

  if (!product) return null;

  const images  = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/400'];
  const fmt     = (n) => parseFloat(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const inStock = product.stock > 0;

  const goBack = () => navigate('/admindashboard', {
    state: { restoreInventory: true, category, scrollY },
  });

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_BASE}/admin/products/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(product.product_id) }),
      });
      if (res.ok) {
        navigate('/admindashboard', { state: { restoreInventory: true, category, scrollY } });
      } else {
        setDeleteError('Failed to delete. Please try again.');
        setDeleting(false);
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="pd-page">

      <header className="dashboard-header">
        <Logo to="#" />
        <div className="user-info">
          <span className="username">Admin</span>
          <button className="dropdown-button" onClick={goBack}>← Back</button>
        </div>
      </header>

      <main className="pd-main">
        <button className="back-button" onClick={goBack}>← Back to Inventory</button>

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
                    className={`pd-thumb${selectedImage === i ? ' pd-thumb-active' : ''}`}
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
            <div className="pd-category-tag">{product.category?.categoryName || 'Product'}</div>
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

            <div className="pd-actions">
              <button
                className="pd-delete-btn"
                onClick={() => { setShowConfirm(true); setDeleteError(''); }}
              >
                🗑 Delete Product
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {showConfirm && (
        <div className="hc-modal-overlay">
          <div className="hc-modal hc-modal--narrow">
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Delete Product</h2>
            </div>
            <div className="hc-modal-body">
              <p className="hc-modal-info-text">
                Are you sure you want to delete<br />
                <strong className="modal-emphasis-dark">{product.name}</strong>?<br />
                <strong className="modal-emphasis-error">This action cannot be undone.</strong>
              </p>
              {deleteError && <p className="hc-modal-delete-error">{deleteError}</p>}
            </div>
            <div className="hc-modal-footer">
              <button
                className={`hc-modal-btn-primary hc-modal-btn-danger${deleting ? ' hc-modal-btn-danger--disabled' : ''}`}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                className="hc-modal-btn-secondary"
                onClick={() => { setShowConfirm(false); setDeleteError(''); }}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}