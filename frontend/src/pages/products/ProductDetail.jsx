import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, deleteProduct } from "../../services/products";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "Failed to load product details");
      if (err.response?.status === 404) {
        alert("Product not found!");
        navigate("/products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) return;

    setDeleting(true);
    try {
      await deleteProduct(id);
      alert("✅ Product deleted successfully!");
      window.dispatchEvent(new Event("productUpdated"));
      navigate("/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
        <Button onClick={fetchProduct} variant="primary">
          Retry Loading
        </Button>
        <Button onClick={() => navigate("/products")} variant="secondary" className="ml-2">
          Back to Products
        </Button>
      </div>
    );
  }

  if (!product) return null;

  // Hitung profit
  const profit = product.sellingPrice - product.hpp;
  const profitMargin = ((profit / product.sellingPrice) * 100).toFixed(1);

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            {product.stock < product.minStock && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">LOW STOCK</span>}
          </div>
          <p className="text-gray-500">
            SKU: <span className="font-mono font-medium">{product.sku}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate(`/products/edit/${id}`)} className="flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting} className="flex items-center">
            {deleting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {deleting ? "Deleting..." : "Delete Product"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/products")} className="flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info Card */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="mt-1 font-medium">{product.category || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="mt-1 font-medium">{product.size || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Color</p>
              <p className="mt-1 font-medium">{product.color || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="mt-1 font-medium">
                {new Date(product.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{product.description || "No description available"}</p>
            </div>
          </div>
        </div>

        {/* Stock & Pricing Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Stock & Pricing</h2>

          <div className="space-y-4">
            {/* Stock Status */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Current Stock</span>
                <span className={`text-lg font-bold ${product.stock < product.minStock ? "text-red-600" : "text-green-600"}`}>{product.stock}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${product.stock < product.minStock ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Min stock: {product.minStock} •{product.stock < product.minStock ? `⚠️ ${product.minStock - product.stock} items needed to reach min stock` : `✅ ${product.stock - product.minStock} items above min stock`}
              </p>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">HPP (Cost)</span>
                <span className="font-medium">Rp {product.hpp.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Selling Price</span>
                <span className="font-medium text-blue-600">Rp {product.sellingPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="font-bold text-green-600">
                  Rp {profit.toLocaleString("id-ID")} ({profitMargin}%)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t">
              <Button variant="primary" className="w-full" onClick={() => navigate(`/stock/in?productId=${product.id}`)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Stock
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate(`/orders/new?productId=${product.id}`)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Create Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
