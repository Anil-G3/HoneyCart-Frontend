import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import API_BASE from './api';

export default function CategoryGrid() {
  const navigate = useNavigate();
  const [username, setUsername]                 = useState('');
  const [cartCount, setCartCount]               = useState(0);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading]               = useState(true);

  const categories = [
    { name: 'Mobiles',                hint: 'Phones & Accessories',   image: '/categories/mobileicon.jpg'       },
    { name: 'Laptops',                hint: 'Work & Gaming',          image: '/categories/lapicon.jpg'          },
    { name: 'TVs',                    hint: 'Smart & 4K Displays',    image: '/categories/tvicon.jpg'           },
    { name: 'Shirts',                 hint: 'Casual & Formal',        image: '/categories/shirticon.jpg'        },
    { name: 'Pants',                  hint: 'Denim & Chinos',         image: '/categories/pantsicon.jpg'        },
    { name: 'Footwears',              hint: 'Sneakers & Formal',      image: '/categories/footwearicon.jpg'     },
    { name: 'Watches',                hint: 'Luxury & Sport',         image: '/categories/watchicon.jpg'        },
    { name: 'Perfumes',               hint: 'Eau de Parfum',          image: '/categories/perfumeicon.jpg'      },
    { name: 'Audio Devices',          hint: 'Headphones & Speakers',  image: '/categories/audiodeviceicon.jpg'  },
    { name: 'Gaming',                 hint: 'Consoles & Controllers', image: '/categories/gamingicon.jpg'       },
    { name: 'Home Appliances',        hint: 'Kitchen & Living',       image: '/categories/appliancesicon.jpg'   },
    { name: 'Electronic Accessories', hint: 'Cables, Hubs & More',    image: '/categories/accessoriesicon.jpeg' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/products?category=Mobiles`, { credentials: 'include' });
        const data = await res.json();
        const name = data?.user?.name || '';
        setUsername(name);
        if (name) {
          const cRes = await fetch(`${API_BASE}/api/cart/items/count?username=${name}`, { credentials: 'include' });
          setCartCount(await cRes.json());
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          ['Mobiles', 'Laptops', 'Watches', 'Footwears', 'Gaming', 'Shirts'].map(cat =>
            fetch(`${API_BASE}/api/products?category=${cat}`, { credentials: 'include' })
              .then(r => r.json())
              .then(d => {
                if (d?.products?.length > 0) {
                  return { ...d.products[0], categoryName: cat };
                }
                return null;
              })
          )
        );
        setTrendingProducts(results.filter(Boolean));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const go = cat => navigate('/customerhome', { state: { selectedCategory: cat } });

  return (
    <div className="cg-page">
      <Header username={username} cartCount={cartCount} />

      <main className="cg-main">

        <section className="cg-hero">
          <div className="cg-hero-grain" />
          <div className="cg-hero-orb cg-hero-orb1" />
          <div className="cg-hero-orb cg-hero-orb2" />

          <div className="cg-hero-content">
            <div className="cg-hero-left">
              <div className="cg-hero-tag">
                <span className="cg-hero-tag-dot" />
                {username ? `Welcome back, ${username}` : 'Welcome to HoneyCart'}
              </div>
              <h1 className="cg-hero-title">
                Every Collection, <em>Curated for You</em>
              </h1>
              <p className="cg-hero-sub">Premium tech, fashion &amp; lifestyle — all in one place.</p>
            </div>

            <div className="cg-hero-right">
              {[['12', 'Collections'], ['500+', 'Products'], ['Free', 'Shipping'], ['24/7', 'Support']].map(([n, l]) => (
                <div key={l} className="cg-hero-stat-card">
                  <span className="cg-hero-stat-num">{n}</span>
                  <span className="cg-hero-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cg-hero-fade" />
        </section>

        <div className="cg-section">
          <div className="cg-section-header">
            <div>
              <p className="cg-section-sub">Browse by</p>
              <h2 className="cg-section-title">Shop by Category</h2>
            </div>
          </div>

          <div className="cg-grid">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="cg-cat-card"
                onClick={() => go(cat.name)}
                role="button"
                tabIndex={0}
                aria-label={`Shop ${cat.name}`}
                onKeyDown={e => e.key === 'Enter' && go(cat.name)}
                style={{ animationDelay: `${i * 0.045}s` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="cg-cat-img"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('cg-no-img');
                  }}
                />
                <span className="cg-cat-img-fallback">{cat.name.charAt(0)}</span>
                <div className="cg-cat-overlay" />
                <div className="cg-cat-text">
                  <span className="cg-cat-name">{cat.name}</span>
                  <span className="cg-cat-hint">{cat.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cg-section-divider">
          <div className="cg-divider-line" />
          <span className="cg-divider-gem">✦</span>
          <div className="cg-divider-line" />
        </div>

        <div className="cg-trending-section">
          <div className="cg-section">
            <div className="cg-section-header">
              <div>
                <p className="cg-section-sub">Hand-picked for you</p>
                <h2 className="cg-section-title">Trending Drops</h2>
              </div>
            </div>
            <div className="cg-products-grid">
              {isLoading ? (
                <p className="cg-loading">Curating trending products…</p>
              ) : trendingProducts.length > 0 ? (
                trendingProducts.map(product => (
                  <div
                    key={product.product_id}
                    className="cg-prod-card"
                    onClick={() => go(product.categoryName || 'Mobiles')}
                  >
                    <div className="cg-prod-img-wrap">
                      <img
                        src={product.images?.length > 0 ? product.images[0] : 'https://via.placeholder.com/240'}
                        alt={product.name}
                        onError={e => { e.target.src = 'https://via.placeholder.com/240'; }}
                      />
                      <div className="cg-prod-img-shine" />
                    </div>
                    <div className="cg-prod-info">
                      <div className="cg-prod-category-tag">{product.categoryName}</div>
                      <div className="cg-prod-name">{product.name}</div>
                      <div className="cg-prod-price-row">
                        <div className="cg-prod-price">₹{product.price?.toLocaleString('en-IN')}</div>
                        <button
                          className="cg-shop-btn"
                          onClick={e => { e.stopPropagation(); go(product.categoryName || 'Mobiles'); }}
                        >
                          Shop
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cg-loading">No trending products available right now.</p>
              )}
            </div>
          </div>
        </div>

        <div className="cg-cta-strip">
          <div className="cg-cta-inner">
            <div className="cg-cta-text">
              <span className="cg-cta-tag-label">Ready to explore?</span>
              <div className="cg-cta-title">Thousands of products awaiting you</div>
              <div className="cg-cta-desc">Free shipping on every order. No minimum required.</div>
            </div>
            <button className="cg-cta-btn" onClick={() => go('Mobiles')}>
              Start Shopping →
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}