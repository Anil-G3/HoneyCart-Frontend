import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import CustomerHomePage from './CustomerHomePage';
import CartPage from './CartPage';
import OrderPage from './OrderPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashBoard';
import CategoryGrid from './CategoryGrid';
import ProtectedRoute from './ProtectedRoute';
import ProductDetailPage from './ProductDetailPage';
import AdminProductDetailPage from './AdminProductDetailPage';

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/admin" element={<AdminLogin />} />

      <Route path="/categories" element={
        <ProtectedRoute requiredRole="CUSTOMER">
          <CategoryGrid />
        </ProtectedRoute>
      } />
      <Route path="/customerhome" element={
        <ProtectedRoute requiredRole="CUSTOMER">
          <CustomerHomePage />
        </ProtectedRoute>
      } />
      <Route path="/UserCartPage" element={
        <ProtectedRoute requiredRole="CUSTOMER">
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute requiredRole="CUSTOMER">
          <OrderPage />
        </ProtectedRoute>
      } />
      <Route path="/product/:id" element={
        <ProtectedRoute requiredRole="CUSTOMER">
          <ProductDetailPage />
        </ProtectedRoute>
      } />

      <Route path="/admindashboard" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/product/:id" element={
        <ProtectedRoute>
          <AdminProductDetailPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;