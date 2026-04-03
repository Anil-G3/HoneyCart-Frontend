import React, { useState, useEffect, useRef } from 'react';
import { ProductList }          from './ProductList';
import { CategoryNavigation }   from './CategoryNavigation';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer }               from './Footer';
import Logo                     from './Logo';
import CustomModal               from './CustomModal';
import API_BASE                  from './api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [modalType,         setModalType]         = useState(null);
  const [response,          setResponse]          = useState(null);
  const [viewInventory,     setViewInventory]     = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [selectedCategory,  setSelectedCategory]  = useState('Mobiles');
  const [pendingDeleteId,   setPendingDeleteId]   = useState(null);

  // Scroll position to restore after inventory reloads on return from product detail
  const pendingScrollY = useRef(null);

  useEffect(() => {
    if (location.state?.restoreInventory) {
      const cat = location.state.category || 'Mobiles';
      const sY  = location.state.scrollY  || 0;
      pendingScrollY.current = sY;
      handleViewInventory(cat);
      window.history.replaceState({}, '');
    }
    if (location.state?.pendingDeleteId) {
      setPendingDeleteId(location.state.pendingDeleteId);
      setModalType('deleteConfirm');
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    if (pendingScrollY.current !== null && inventoryProducts.length > 0) {
      const y = pendingScrollY.current;
      pendingScrollY.current = null;
      // Double rAF ensures the product grid has painted before scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        });
      });
    }
  }, [inventoryProducts]);

  const cardData = [
    { title: 'Manage Inventory',  description: 'View all live products and current stock levels',       team: 'Inventory',          action:    'viewInventory'   },
    { title: 'Add Product',       description: 'Create a new product listing with image and category',  team: 'Product Management', modalType: 'addProduct'      },
    { title: 'Modify Product',    description: "Edit an existing product's details, price or stock",    team: 'Product Management', modalType: 'modifyProduct'   },
    { title: 'Add Category',      description: 'Create a new product category for the store',           team: 'Inventory',          modalType: 'addCategory'     },
    { title: 'Modify User',       description: 'Update user details and manage account roles',          team: 'User Management',    modalType: 'modifyUser'      },
    { title: 'View User Details', description: 'Fetch and display details of a specific user',          team: 'User Management',    modalType: 'viewUser'        },
    { title: 'Monthly Business',  description: 'View revenue metrics for a specific month and year',    team: 'Analytics',          modalType: 'monthlyBusiness' },
    { title: 'Daily Business',    description: 'Track revenue and transactions for a specific date',    team: 'Analytics',          modalType: 'dailyBusiness'   },
    { title: 'Yearly Business',   description: 'Analyze annual revenue performance by year',            team: 'Analytics',          modalType: 'yearlyBusiness'  },
    { title: 'Overall Business',  description: 'View total revenue and category sales since inception', team: 'Analytics',          modalType: 'overallBusiness' },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      if (res.ok) navigate('/admin');
    } catch (e) { console.error(e); }
  };

  const handleViewInventory = async (category = selectedCategory) => {
    try {
      const res = await fetch(`${API_BASE}/api/products?category=${category}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInventoryProducts(data.products || []);
        setSelectedCategory(category);
        setViewInventory(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddProductSubmit = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/add`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResponse({ product: { ...data, imageUrl: productData.imageUrl } });
      setModalType('addProduct');
    } catch (e) { console.error(e); }
  };

  const handleModifyProductSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/modify`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = res.ok ? await res.json() : null;
      setResponse(result ? { product: result } : { message: await res.text() });
      setModalType('modifyProduct');
    } catch (e) {
      setResponse({ message: 'Something went wrong.' });
      setModalType('modifyProduct');
    }
  };

  const handleDeleteProductSubmit = async ({ productId }) => {
    if (!productId) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/delete`, {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(productId) }),
      });
      if (res.ok) {
        setModalType(null);
        setInventoryProducts(prev => prev.filter(p => p.product_id !== productId));
        setPendingDeleteId(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddCategory = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/categories/add`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: data.categoryName }),
      });
      const result = res.ok ? await res.json() : null;
      setResponse(result ? { category: result } : { message: await res.text() });
      setModalType('addCategory');
    } catch (e) {
      setResponse({ message: 'Something went wrong.' });
      setModalType('addCategory');
    }
  };

  const handleViewUserSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/user/getbyid/${data.userId}`, {
        method: 'GET', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      setResponse(res.ok ? { user: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType('response');
    } catch (e) {
      setResponse({ message: 'Error: Something went wrong' });
      setModalType('response');
    }
  };

  const handleModifyUserSubmit = async (data) => {
    const url    = data.username ? `${API_BASE}/admin/user/modify` : `${API_BASE}/admin/user/getbyid`;
    const method = data.username ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.username ? data : { userId: data.userId }),
      });
      setResponse(res.ok ? { user: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType(data.username ? 'response' : 'modifyUser');
    } catch (e) {
      setResponse({ message: 'Error: Something went wrong' });
      setModalType('response');
    }
  };

  const handleMonthlyBusiness = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/business/monthly?month=${data?.month}&year=${data?.year}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      setResponse(res.ok ? { monthlyBusiness: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType('monthlyBusiness');
    } catch (e) { setResponse({ message: 'Error: Something went wrong' }); setModalType('response'); }
  };

  const handleDailyBusiness = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/business/daily?date=${data?.date}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      setResponse(res.ok ? { dailyBusiness: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType('dailyBusiness');
    } catch (e) { setResponse({ message: 'Error: Something went wrong' }); setModalType('dailyBusiness'); }
  };

  const handleYearlyBusiness = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/business/yearly?year=${data?.year}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      setResponse(res.ok ? { yearlyBusiness: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType('yearlyBusiness');
    } catch (e) { setResponse({ message: 'Error: Something went wrong' }); setModalType('yearlyBusiness'); }
  };

  const handleOverallBusiness = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/business/overall`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      setResponse(res.ok ? { overallBusiness: await res.json() } : { message: `Error: ${await res.text()}` });
      setModalType('overallBusiness');
    } catch (e) { setResponse({ message: 'Error: Something went wrong' }); setModalType('overallBusiness'); }
  };

  return (
    <div className="admin-dashboard">

      <header className="dashboard-header">
        <Logo to="#" />
        <div className="user-info">
          <span className="username">Admin</span>
          {viewInventory && (
            <button className="dropdown-button" onClick={() => setViewInventory(false)}>
              ← Dashboard
            </button>
          )}
          <div className="dropdown">
            <button className="dropdown-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {viewInventory && (
        <nav className="navigation">
          <CategoryNavigation
            onCategoryClick={cat => handleViewInventory(cat)}
            activeCategory={selectedCategory}
          />
        </nav>
      )}

      <main className={viewInventory ? 'main-content' : 'dashboard-content'}>
        {viewInventory ? (
          <div className="inventory-view">
            <ProductList
              products={inventoryProducts}
              isAdmin={true}
              selectedCategory={selectedCategory}
              onDeleteProduct={productId => {
                setPendingDeleteId(productId);
                setModalType('deleteConfirm');
              }}
            />
          </div>
        ) : (
          <div>
            <h1 className="form-title admin-dashboard-title">Admin Dashboard</h1>
            <div className="cards-grid">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className="card"
                  onClick={() => {
                    if (card.action === 'viewInventory') {
                      handleViewInventory();
                    } else {
                      setModalType(card.modalType);
                      setResponse(null);
                    }
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title">{card.title}</h3>
                    <p className="card-description">{card.description}</p>
                    <span className="card-team">{card.team}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => { setModalType(null); setResponse(null); }}
          onSubmit={data => {
            switch (modalType) {
              case 'deleteConfirm':   handleDeleteProductSubmit({ productId: pendingDeleteId }); break;
              case 'addProduct':      handleAddProductSubmit(data);    break;
              case 'modifyProduct':   handleModifyProductSubmit(data); break;
              case 'addCategory':     handleAddCategory(data);         break;
              case 'viewUser':        handleViewUserSubmit(data);      break;
              case 'modifyUser':      handleModifyUserSubmit(data);    break;
              case 'monthlyBusiness': handleMonthlyBusiness(data);     break;
              case 'dailyBusiness':   handleDailyBusiness(data);       break;
              case 'yearlyBusiness':  handleYearlyBusiness(data);      break;
              case 'overallBusiness': handleOverallBusiness();         break;
              default: break;
            }
          }}
          response={response}
        />
      )}

    </div>
  );
};

export default AdminDashboard;