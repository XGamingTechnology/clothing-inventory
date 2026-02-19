import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../services/products";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const ProductsList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();

    // ✅ AUTO-REFRESH SAAT ADA PERUBAHAN PRODUK
    const handleProductUpdated = () => {
      fetchProducts();
    };

    window.addEventListener("productUpdated", handleProductUpdated);
    return () => window.removeEventListener("productUpdated", handleProductUpdated);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      // ✅ Optimistic update: hapus dari UI langsung
      setProducts((prev) => prev.filter((p) => p.id !== id));

      // ✅ Hapus dari backend
      await deleteProduct(id);

      // ✅ Trigger refresh global
      window.dispatchEvent(new Event("productUpdated"));

      alert("✅ Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);

      // ✅ Rollback jika gagal: fetch ulang data
      alert(`❌ Delete failed: ${err.response?.data?.message || "Please try again"}`);
      fetchProducts(); // Restore original data
    } finally {
      setDeletingId(null);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
        <Button onClick={fetchProducts} variant="primary">
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-500">
            Total: {products.length} products • Low stock: {products.filter((p) => p.stock < p.minStock).length}
          </p>
        </div>
        <Link to="/products/new">
          <Button variant="primary" className="w-full sm:w-auto">
            + Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Get started by adding your first product</p>
          <div className="mt-6">
            <Link to="/products/new">
              <Button variant="primary">Add Your First Product</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">HPP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${product.stock < product.minStock ? "bg-red-50/30" : ""}`} onClick={() => (window.location.href = `/products/${product.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600 hover:text-blue-800 transition-colors">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium text-blue-600 hover:text-blue-800 transition-colors">{product.name}</span>
                      {product.size && <span className="ml-2 text-xs text-gray-500">({product.size})</span>}
                      {product.color && <span className="ml-1 text-xs text-gray-500">• {product.color}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{product.category || "-"}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${product.stock < product.minStock ? "text-red-600 font-bold" : "text-green-600"}`}>
                      {product.stock}
                      {product.stock < product.minStock && <span className="ml-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">LOW</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">Rp {product.hpp.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">Rp {product.sellingPrice.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 font-medium transition-colors hover:underline" onClick={(e) => e.stopPropagation()}>
                          Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                          }}
                          disabled={deletingId === product.id}
                          className={`${deletingId === product.id ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-900"} font-medium transition-colors hover:underline`}
                          aria-label={`Delete product ${product.name}`}
                        >
                          {deletingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
