import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProductsList from "./pages/products/ProductsList";
import ProductForm from "./pages/products/ProductForm";
import OrdersList from "./pages/orders/OrdersList";
import OrderForm from "./pages/orders/OrderForm";
import StockList from "./pages/stock/StockList";
import StockInForm from "./pages/stock/StockInForm";
import ProductDetail from "./pages/products/ProductDetail";
import Layout from "./components/layout/Layout";

const RoutesComponent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Tunggu auth context selesai loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* Protected Routes */
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/stock" element={<StockList />} />
          <Route path="/stock/in" element={<StockInForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
};

export default RoutesComponent;
