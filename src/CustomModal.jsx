import React, { useState, useEffect } from 'react';
import API_BASE from './api';

// Field components defined outside CustomModal to prevent cursor-jump on re-render
const Field = ({ name, label, placeholder, type = 'text', value, onChange, error }) => (
  <div className="hc-modal-field-validated">
    <div className="hc-modal-field-row">
      <label className="hc-modal-label">{label}</label>
      <div className="hc-modal-input-wrap">
        <input
          className={`hc-modal-input${error ? ' input-error' : ''}`}
          type={type} name={name} placeholder={placeholder}
          value={value} onChange={onChange}
        />
        {error && <span className="hc-field-error">{error}</span>}
      </div>
    </div>
  </div>
);

const TextareaField = ({ name, label, placeholder, value, onChange, error }) => (
  <div className="hc-modal-field-validated">
    <div className="hc-modal-field-row">
      <label className="hc-modal-label">{label}</label>
      <div className="hc-modal-input-wrap">
        <textarea
          className={`hc-modal-input hc-modal-textarea${error ? ' input-error' : ''}`}
          name={name} placeholder={placeholder}
          value={value} onChange={onChange}
        />
        {error && <span className="hc-field-error">{error}</span>}
      </div>
    </div>
  </div>
);


const CustomModal = ({ modalType, onClose, onSubmit, response }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '',
    categoryId: '', imageUrl: '', month: '', year: '', date: '', categoryName: '',
  });
  const [inputValue,  setInputValue]  = useState('');
  const [errors,      setErrors]      = useState({});
  const [isWideModal, setIsWideModal] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleGeneralInputChange = (e) => {
    setInputValue(e.target.value);
    setErrors({});
  };

  const validateAddProduct = () => {
    const e = {};
    if (!formData.name.trim())           e.name        = 'Product name is required.';
    if (!formData.price)                 e.price       = 'Price is required.';
    else if (isNaN(formData.price) || +formData.price <= 0)
                                         e.price       = 'Enter a valid price greater than 0.';
    if (!formData.stock)                 e.stock       = 'Stock quantity is required.';
    else if (isNaN(formData.stock) || +formData.stock < 0)
                                         e.stock       = 'Enter a valid stock number.';
    if (!formData.categoryId)            e.categoryId  = 'Category ID is required.';
    else if (isNaN(formData.categoryId)) e.categoryId  = 'Category ID must be a number.';
    if (!formData.imageUrl.trim())       e.imageUrl    = 'Image URL is required.';
    if (!formData.description.trim())    e.description = 'Description is required.';
    return e;
  };

  const validateViewUser = () => {
    const e = {};
    if (!inputValue.trim())     e.userId = 'Please enter a User ID.';
    else if (isNaN(inputValue)) e.userId = 'User ID must be a number.';
    return e;
  };

  const validateMonthly = () => {
    const e = {};
    if (!formData.month)                                  e.month = 'Month is required.';
    else if (+formData.month < 1 || +formData.month > 12) e.month = 'Enter a valid month (1–12).';
    if (!formData.year)                                   e.year  = 'Year is required.';
    else if (formData.year.length !== 4 || isNaN(formData.year))
                                                          e.year  = 'Enter a valid 4-digit year.';
    return e;
  };

  const validateDaily = () => {
    const e = {};
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formData.date.trim())               e.date = 'Date is required.';
    else if (!dateRegex.test(formData.date)) e.date = 'Use format YYYY-MM-DD.';
    return e;
  };

  const validateYearly = () => {
    const e = {};
    if (!formData.year)                                        e.year = 'Year is required.';
    else if (formData.year.length !== 4 || isNaN(formData.year))
                                                               e.year = 'Enter a valid 4-digit year.';
    return e;
  };

  const validateAddCategory = () => {
    const e = {};
    if (!formData.categoryName.trim()) e.categoryName = 'Category name is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let ve = {};
    switch (modalType) {
      case 'addProduct': {
        ve = validateAddProduct();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock, 10), categoryId: parseInt(formData.categoryId, 10) });
        break;
      }
      case 'viewUser': {
        ve = validateViewUser();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ userId: parseInt(inputValue, 10) });
        break;
      }
      case 'addCategory': {
        ve = validateAddCategory();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ categoryName: formData.categoryName.trim() });
        break;
      }
      case 'monthlyBusiness': {
        ve = validateMonthly();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ month: formData.month, year: formData.year });
        break;
      }
      case 'dailyBusiness': {
        ve = validateDaily();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ date: formData.date });
        break;
      }
      case 'yearlyBusiness': {
        ve = validateYearly();
        if (Object.keys(ve).length > 0) { setErrors(ve); return; }
        onSubmit({ year: formData.year });
        break;
      }
      case 'overallBusiness': { onSubmit(); break; }
      default: break;
    }
  };

  return (
    <div className="hc-modal-overlay">
      <div className={`hc-modal${isWideModal ? ' hc-modal-wide' : ''}`}>

        {/* Add product — form */}
        {modalType === 'addProduct' && !response && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Add Product</h2>
            </div>
            <div className="hc-modal-body">
              {[
                { name: 'name',       label: 'Name',        placeholder: 'Product name', type: 'text'   },
                { name: 'price',      label: 'Price',       placeholder: '0.00',         type: 'number' },
                { name: 'stock',      label: 'Stock',       placeholder: 'Quantity',     type: 'number' },
                { name: 'categoryId', label: 'Category ID', placeholder: 'Category ID',  type: 'number' },
                { name: 'imageUrl',   label: 'Image URL',   placeholder: 'https://...',  type: 'text'   },
              ].map(({ name, label, placeholder, type }) => (
                <Field key={name} name={name} label={label} placeholder={placeholder}
                  type={type} value={formData[name]} onChange={handleInputChange} error={errors[name]} />
              ))}
              <TextareaField name="description" label="Description"
                placeholder="Product description" value={formData.description}
                onChange={handleInputChange} error={errors.description} />
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-primary"   onClick={handleSubmit}>Submit</button>
              <button className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* Add product — result */}
        {modalType === 'addProduct' && response && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Product Added</h2>
            </div>
            <div className="hc-modal-body">
              <div className="hc-modal-response-success">✓ Product added successfully</div>
              <div className="modal-product-preview">
                <img src={response.product.imageUrl} alt={response.product.name} className="modal-product-img" />
                <div className="hc-modal-response-card modal-product-card">
                  {[
                    ['Name',        response?.product?.name],
                    ['Description', response?.product?.description],
                    ['Price',       response?.product?.price],
                    ['Stock',       response?.product?.stock],
                    ['Category',    response?.product?.category?.categoryName],
                  ].map(([k, v]) => v !== undefined && (
                    <div key={k} className="hc-modal-response-row">
                      <span className="hc-modal-response-key">{k}</span>
                      <span className="hc-modal-response-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-secondary" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {/* Delete confirmation */}
        {modalType === 'deleteConfirm' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Delete Product</h2>
            </div>
            <div className="hc-modal-body">
              <p className="hc-modal-info-text">
                Are you sure you want to delete this product?<br />
                <strong className="modal-emphasis-error">This action cannot be undone.</strong>
              </p>
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-primary hc-modal-btn-danger" onClick={() => onSubmit()}>
                Yes, Delete
              </button>
              <button className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* Add category — form */}
        {modalType === 'addCategory' && !response && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Add Category</h2>
            </div>
            <div className="hc-modal-body">
              <Field name="categoryName" label="Name" placeholder="e.g. Electronics"
                value={formData.categoryName} onChange={handleInputChange}
                error={errors.categoryName} />
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-primary"   onClick={handleSubmit}>Add Category</button>
              <button className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* Add category — result */}
        {modalType === 'addCategory' && response && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">{response.category ? 'Category Added' : 'Error'}</h2>
            </div>
            <div className="hc-modal-body">
              {response.category ? (
                <>
                  <div className="hc-modal-response-success">✓ Category added successfully</div>
                  <div className="hc-modal-response-card">
                    <div className="hc-modal-response-row">
                      <span className="hc-modal-response-key">Category ID</span>
                      <span className="hc-modal-response-val">{response.category.categoryId}</span>
                    </div>
                    <div className="hc-modal-response-row">
                      <span className="hc-modal-response-key">Name</span>
                      <span className="hc-modal-response-val">{response.category.categoryName}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hc-modal-response-message hc-modal-response-error">
                  ⚠ {response.message || 'Something went wrong.'}
                </div>
              )}
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-secondary" onClick={onClose}>Close</button>
            </div>
          </>
        )}

        {/* View user */}
        {modalType === 'viewUser' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">View User Details</h2>
            </div>
            <div className="hc-modal-body">
              <div className="hc-modal-field-validated">
                <div className="hc-modal-field-row">
                  <label className="hc-modal-label">User ID</label>
                  <div className="hc-modal-input-wrap">
                    <input
                      className={`hc-modal-input${errors.userId ? ' input-error' : ''}`}
                      type="number" placeholder="Enter User ID"
                      value={inputValue} onChange={handleGeneralInputChange}
                    />
                    {errors.userId && <span className="hc-field-error">{errors.userId}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-primary"   onClick={handleSubmit}>Submit</button>
              <button className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* Response — user details */}
        {modalType === 'response' && response && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">{response.user ? 'User Details' : 'Error'}</h2>
            </div>
            <div className="hc-modal-body">
              {response.user ? (
                <div className="hc-modal-response-card">
                  {[
                    ['User ID',    response.user.userId],
                    ['Username',   response.user.username],
                    ['Email',      response.user.email],
                    ['Role',       response.user.role],
                    ['Created At', new Date(response.user.createdAt).toLocaleString()],
                    ['Updated At', new Date(response.user.updatedAt).toLocaleString()],
                  ].map(([k, v]) => (
                    <div key={k} className="hc-modal-response-row">
                      <span className="hc-modal-response-key">{k}</span>
                      <span className="hc-modal-response-val">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hc-modal-response-message hc-modal-response-error">
                  ⚠ User not found or something went wrong.
                </div>
              )}
            </div>
            <div className="hc-modal-footer">
              <button className="hc-modal-btn-secondary" onClick={onClose}>Back to Dashboard</button>
            </div>
          </>
        )}

        {/* Monthly business */}
        {modalType === 'monthlyBusiness' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Monthly Business</h2>
            </div>
            <div className="hc-modal-body">
              {!response ? (
                <>
                  <Field name="month" label="Month" placeholder="e.g. 10" type="number"
                    value={formData.month} onChange={handleInputChange} error={errors.month} />
                  <Field name="year"  label="Year"  placeholder="e.g. 2025" type="number"
                    value={formData.year}  onChange={handleInputChange} error={errors.year}  />
                </>
              ) : (
                <BusinessResponse data={response?.monthlyBusiness} />
              )}
            </div>
            <div className="hc-modal-footer">
              {!response && <button className="hc-modal-btn-primary" onClick={handleSubmit}>Get Report</button>}
              <button className="hc-modal-btn-secondary" onClick={onClose}>{response ? 'Close' : 'Cancel'}</button>
            </div>
          </>
        )}

        {/* Daily business */}
        {modalType === 'dailyBusiness' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Daily Business</h2>
            </div>
            <div className="hc-modal-body">
              {!response ? (
                <Field name="date" label="Date" placeholder="YYYY-MM-DD"
                  value={formData.date} onChange={handleInputChange} error={errors.date} />
              ) : (
                <BusinessResponse data={response?.dailyBusiness} />
              )}
            </div>
            <div className="hc-modal-footer">
              {!response && <button className="hc-modal-btn-primary" onClick={handleSubmit}>Get Report</button>}
              <button className="hc-modal-btn-secondary" onClick={onClose}>{response ? 'Close' : 'Cancel'}</button>
            </div>
          </>
        )}

        {/* Yearly business */}
        {modalType === 'yearlyBusiness' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Yearly Business</h2>
            </div>
            <div className="hc-modal-body">
              {!response ? (
                <Field name="year" label="Year" placeholder="e.g. 2025" type="number"
                  value={formData.year} onChange={handleInputChange} error={errors.year} />
              ) : (
                <BusinessResponse data={response?.yearlyBusiness} />
              )}
            </div>
            <div className="hc-modal-footer">
              {!response && <button className="hc-modal-btn-primary" onClick={handleSubmit}>Get Report</button>}
              <button className="hc-modal-btn-secondary" onClick={onClose}>{response ? 'Close' : 'Cancel'}</button>
            </div>
          </>
        )}

        {/* Overall business */}
        {modalType === 'overallBusiness' && (
          <>
            <div className="hc-modal-header">
              <h2 className="hc-modal-title">Overall Business</h2>
            </div>
            <div className="hc-modal-body">
              {!response ? (
                <p className="hc-modal-info-text">
                  Fetch total revenue and category-wise sales since inception.
                </p>
              ) : (
                <BusinessResponse data={response?.overallBusiness} />
              )}
            </div>
            <div className="hc-modal-footer">
              {!response && <button className="hc-modal-btn-primary" onClick={handleSubmit}>Get Overall Report</button>}
              <button className="hc-modal-btn-secondary" onClick={onClose}>{response ? 'Close' : 'Cancel'}</button>
            </div>
          </>
        )}

        {/* Modify user */}
        {modalType === 'modifyUser' && <ModifyUserFormComponent onClose={onClose} />}

        {/* Modify product */}
        {modalType === 'modifyProduct' && (
          <ModifyProductFormComponent
            onClose={onClose}
            onSubmit={onSubmit}
            response={response}
            onWide={setIsWideModal}
          />
        )}

      </div>
    </div>
  );
};

export default CustomModal;


const BusinessResponse = ({ data }) => {
  if (!data) return null;
  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div>
      <div className="hc-modal-response-card business-top-card">
        <div className="hc-modal-response-row">
          <span className="hc-modal-response-key">Total Business</span>
          <span className="hc-modal-response-val business-total-val">{formatINR(data?.totalBusiness)}</span>
        </div>
      </div>
      {data?.categorySales && Object.keys(data.categorySales).length > 0 && (
        <>
          <div className="hc-modal-step-badge business-category-badge">Category Sales</div>
          <div className="hc-modal-response-card">
            {Object.keys(data.categorySales).map(key => (
              <div key={key} className="hc-modal-response-row">
                <span className="hc-modal-response-key">{key}</span>
                <span className="hc-modal-response-val">{data.categorySales[key]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};


const ModifyUserFormComponent = ({ onClose }) => {
  const [userId,      setUserId]      = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [updated,     setUpdated]     = useState(false);
  const [fetchError,  setFetchError]  = useState('');
  const [userIdError, setUserIdError] = useState('');

  const handleFetchUser = async (e) => {
    e.preventDefault();
    setFetchError(''); setUserIdError('');
    if (!userId.trim())  { setUserIdError('Please enter a User ID.'); return; }
    if (isNaN(userId))   { setUserIdError('User ID must be a number.'); return; }
    try {
      const res = await fetch(`${API_BASE}/admin/user/getbyid/${userId}`, {
        method: 'GET', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) setUserDetails(await res.json());
      else        setFetchError('No user found with that ID. Please try again.');
    } catch { setFetchError('Something went wrong. Please try again.'); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await fetch(`${API_BASE}/admin/user/modify`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:   +userId,
          username: fd.get('username'),
          email:    fd.get('email'),
          role:     fd.get('role'),
        }),
      });
      if (res.ok) { const user = await res.json(); setUpdated(true); setUserDetails(user); }
    } catch { /* silent — UI shows no update confirmation on failure */ }
  };

  if (!userDetails) return (
    <>
      <div className="hc-modal-header"><h2 className="hc-modal-title">Modify User</h2></div>
      <form onSubmit={handleFetchUser}>
        <div className="hc-modal-body">
          <div className="hc-modal-field-validated">
            <div className="hc-modal-field-row">
              <label className="hc-modal-label" htmlFor="user-id">User ID</label>
              <div className="hc-modal-input-wrap">
                <input
                  className={`hc-modal-input${userIdError || fetchError ? ' input-error' : ''}`}
                  type="text" id="user-id" placeholder="Enter User ID" value={userId}
                  onChange={e => { setUserId(e.target.value); setUserIdError(''); setFetchError(''); }}
                />
                {userIdError && <span className="hc-field-error">{userIdError}</span>}
                {fetchError  && <span className="hc-field-error">{fetchError}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="hc-modal-footer">
          <button type="submit"  className="hc-modal-btn-primary">Get User</button>
          <button type="button"  className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </>
  );

  if (userDetails && !updated) return (
    <>
      <div className="hc-modal-header"><h2 className="hc-modal-title">Modify User</h2></div>
      <form onSubmit={handleUpdateUser}>
        <div className="hc-modal-body">
          <div className="hc-modal-step-badge">Editing User #{userId}</div>
          {[
            { id: 'user-id',  name: 'user-id',  label: 'User ID',  value: userId,                readOnly: true  },
            { id: 'username', name: 'username',  label: 'Username', value: userDetails?.username, readOnly: false },
            { id: 'email',    name: 'email',     label: 'Email',    value: userDetails?.email,    readOnly: false },
            { id: 'role',     name: 'role',      label: 'Role',     value: userDetails?.role,     readOnly: false },
          ].map(({ id, name, label, value, readOnly }) => (
            <div key={id} className="hc-modal-field">
              <label className="hc-modal-label" htmlFor={id}>{label}</label>
              <input
                className={`hc-modal-input${readOnly ? ' hc-modal-input--readonly' : ''}`}
                type="text" id={id} name={name}
                defaultValue={value} readOnly={readOnly}
              />
            </div>
          ))}
        </div>
        <div className="hc-modal-footer">
          <button type="submit"  className="hc-modal-btn-primary">Save Changes</button>
          <button type="button"  className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </>
  );

  if (updated) return (
    <>
      <div className="hc-modal-header"><h2 className="hc-modal-title">User Updated</h2></div>
      <div className="hc-modal-body">
        <div className="hc-modal-response-success">✓ User updated successfully</div>
        <div className="hc-modal-response-card">
          {[
            ['User ID',  userDetails.userId],
            ['Username', userDetails.username],
            ['Email',    userDetails.email],
            ['Role',     userDetails.role],
          ].map(([k, v]) => (
            <div key={k} className="hc-modal-response-row">
              <span className="hc-modal-response-key">{k}</span>
              <span className="hc-modal-response-val">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hc-modal-footer">
        <button className="hc-modal-btn-secondary" onClick={onClose}>Close</button>
      </div>
    </>
  );

  return null;
};


const ModifyProductFormComponent = ({ onClose, onSubmit, response, onWide }) => {
  const [productId,      setProductId]      = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [fetchError,     setFetchError]     = useState('');
  const [productIdError, setProductIdError] = useState('');
  const [previewImage,   setPreviewImage]   = useState('');

  useEffect(() => {
    return () => onWide(false);
  }, []);

  const handleFetchProduct = async (e) => {
    e.preventDefault();
    setFetchError(''); setProductIdError('');
    if (!productId.trim())  { setProductIdError('Please enter a Product ID.'); return; }
    if (isNaN(productId))   { setProductIdError('Product ID must be a number.'); return; }
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'GET', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setProductDetails(data);
        setPreviewImage(data.imageUrl || '');
        onWide(true);
      } else {
        setFetchError('No product found with that ID. Please try again.');
      }
    } catch { setFetchError('Something went wrong. Please try again.'); }
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      productId:   +productId,
      name:        fd.get('name')        || undefined,
      description: fd.get('description') || undefined,
      price:       fd.get('price')       ? parseFloat(fd.get('price'))    : undefined,
      stock:       fd.get('stock')       ? parseInt(fd.get('stock'), 10)  : undefined,
      imageUrl:    fd.get('imageUrl')    || undefined,
      categoryId:  fd.get('categoryId') ? parseInt(fd.get('categoryId'), 10) : undefined,
    });
  };

  // Step 1 — enter product ID
  if (!productDetails && !response) return (
    <>
      <div className="hc-modal-header">
        <h2 className="hc-modal-title">Modify Product</h2>
      </div>
      <form onSubmit={handleFetchProduct}>
        <div className="hc-modal-body">
          <div className="hc-modal-field-validated">
            <div className="hc-modal-field-row">
              <label className="hc-modal-label" htmlFor="product-id">Product ID</label>
              <div className="hc-modal-input-wrap">
                <input
                  className={`hc-modal-input${productIdError || fetchError ? ' input-error' : ''}`}
                  type="text" id="product-id" placeholder="Enter Product ID"
                  value={productId}
                  onChange={e => { setProductId(e.target.value); setProductIdError(''); setFetchError(''); }}
                />
                {productIdError && <span className="hc-field-error">{productIdError}</span>}
                {fetchError     && <span className="hc-field-error">{fetchError}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="hc-modal-footer">
          <button type="submit"  className="hc-modal-btn-primary">Get Product</button>
          <button type="button"  className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </>
  );

  // Step 2 — edit fields
  if (productDetails && !response) return (
    <>
      <div className="hc-modal-header">
        <h2 className="hc-modal-title">Modify Product</h2>
      </div>
      <form onSubmit={handleUpdateProduct}>
        <div className="hc-modal-body">
          <div className="hc-modal-step-badge">Editing Product #{productId}</div>
          <div className="mp-layout">
            <div className="mp-image-col-new">
              <div className="mp-image-box">
                <img
                  src={previewImage || ''}
                  alt="Product"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="mp-image-label">Preview</span>
              <div className="mp-image-url-col">
                <label className="hc-modal-label">Image URL</label>
                <input
                  className="hc-modal-input"
                  type="text" name="imageUrl"
                  defaultValue={productDetails?.imageUrl}
                  onChange={e => setPreviewImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mp-fields-col-new">
              <span className="mp-category-tag">{productDetails?.category?.categoryName || 'Product'}</span>
              <div className="mp-divider" />
              <div className="mp-fields-grid">
                {[
                  { id: 'name',       label: 'Name',        defaultValue: productDetails?.name },
                  { id: 'price',      label: 'Price',       defaultValue: productDetails?.price },
                  { id: 'stock',      label: 'Stock',       defaultValue: productDetails?.stock },
                  { id: 'categoryId', label: 'Category ID', defaultValue: productDetails?.category?.categoryId },
                ].map(({ id, label, defaultValue }) => (
                  <div key={id} className="mp-field">
                    <label className="hc-modal-label" htmlFor={id}>{label}</label>
                    <input className="hc-modal-input" type="text" id={id} name={id} defaultValue={defaultValue} />
                  </div>
                ))}
                <div className="mp-field mp-field-full">
                  <label className="hc-modal-label">Description</label>
                  <textarea className="hc-modal-input mp-textarea"
                    name="description" defaultValue={productDetails?.description} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hc-modal-footer">
          <button type="submit"  className="hc-modal-btn-primary">Save Changes</button>
          <button type="button"  className="hc-modal-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </>
  );

  // Step 3 — result
  if (response) return (
    <>
      <div className="hc-modal-header">
        <h2 className="hc-modal-title">{response.product ? 'Product Updated' : 'Error'}</h2>
      </div>
      <div className="hc-modal-body">
        {response.product ? (
          <>
            <div className="hc-modal-response-success">✓ Product updated successfully</div>
            <div className="modal-product-preview">
              <img src={response.product.imageUrl} alt={response.product.name} className="modal-product-img modal-product-img--sm" />
              <div className="hc-modal-response-card modal-product-card">
                {[
                  ['Name',        response.product.name],
                  ['Price',       response.product.price],
                  ['Stock',       response.product.stock],
                  ['Category',    response.product.category?.categoryName],
                  ['Description', response.product.description],
                ].map(([k, v]) => v !== undefined && (
                  <div key={k} className="hc-modal-response-row">
                    <span className="hc-modal-response-key">{k}</span>
                    <span className="hc-modal-response-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="hc-modal-response-message hc-modal-response-error">
            ⚠ {response.message || 'Something went wrong.'}
          </div>
        )}
      </div>
      <div className="hc-modal-footer">
        <button className="hc-modal-btn-secondary" onClick={onClose}>Close</button>
      </div>
    </>
  );

  return null;
};