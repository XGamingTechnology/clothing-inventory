import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { createProduct, updateProduct, getProductById } from "../../services/products";
import { useAuth } from "../../context/AuthContext";

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  sku: Yup.string()
    .required("SKU is required")
    .matches(/^[a-zA-Z0-9-]+$/, "SKU can only contain letters, numbers, and hyphens")
    .min(3, "SKU must be at least 3 characters"),
  hpp: Yup.number().min(1, "HPP must be at least Rp 1").required("HPP is required").typeError("HPP must be a valid number"),
  sellingPrice: Yup.number()
    .min(1, "Selling price must be at least Rp 1")
    .required("Selling price is required")
    .typeError("Selling price must be a valid number")
    .test("greater-than-hpp", "Selling price must be higher than HPP", function (value) {
      const { hpp } = this.parent;
      return value > parseFloat(hpp || 0);
    }),
  stock: Yup.number().min(0, "Stock cannot be negative").required("Stock is required").integer("Stock must be a whole number").typeError("Stock must be a valid number"),
  minStock: Yup.number().min(0, "Min stock cannot be negative").required("Min stock is required").integer("Min stock must be a whole number").typeError("Min stock must be a valid number"),
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialValues, setInitialValues] = useState({
    name: "",
    sku: "",
    category: "",
    size: "",
    color: "",
    hpp: "",
    sellingPrice: "",
    stock: "0",
    minStock: "5",
    description: "",
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await getProductById(id);
      setInitialValues({
        name: product.name,
        sku: product.sku,
        category: product.category || "",
        size: product.size || "",
        color: product.color || "",
        hpp: product.hpp.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        description: product.description || "",
      });
    } catch (err) {
      console.error("Error loading product:", err);
      const message = err.response?.data?.message || "Failed to load product details";
      setError(message);
      if (err.response?.status === 404) {
        alert("Product not found! Redirecting to products list.");
        navigate("/products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    setError(null);

    try {
      // ✅ FIX KRITIS: Konversi ke string dulu sebelum trim()
      const hppStr = String(values.hpp).trim();
      const sellingPriceStr = String(values.sellingPrice).trim();
      const stockStr = String(values.stock).trim();
      const minStockStr = String(values.minStock).trim();

      const hpp = hppStr === "" ? 0 : parseFloat(hppStr);
      const sellingPrice = sellingPriceStr === "" ? 0 : parseFloat(sellingPriceStr);
      const stock = stockStr === "" ? 0 : parseInt(stockStr, 10);
      const minStock = minStockStr === "" ? 0 : parseInt(minStockStr, 10);

      // Validasi minimal nilai
      if (hpp <= 0) throw new Error("HPP must be greater than 0");
      if (sellingPrice <= 0) throw new Error("Selling price must be greater than 0");
      if (stock < 0) throw new Error("Stock cannot be negative");
      if (minStock < 0) throw new Error("Min stock cannot be negative");

      const productData = {
        name: values.name.trim(),
        sku: values.sku.trim().toUpperCase(),
        category: values.category.trim() || null,
        size: values.size.trim() || null,
        color: values.color.trim() || null,
        hpp,
        sellingPrice,
        stock,
        minStock,
        description: values.description.trim() || null,
      };

      if (id) {
        await updateProduct(id, productData);
        alert("✅ Product updated successfully!");
      } else {
        await createProduct(productData);
        alert("✅ Product created successfully!");
      }

      // Trigger refresh di seluruh aplikasi
      window.dispatchEvent(new Event("productUpdated"));
      navigate("/products", { replace: true });
    } catch (err) {
      console.error("Error saving product:", err);

      let message = "Failed to save product. Please check all fields.";

      if (err.response) {
        if (err.response.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            message = err.response.data.message.join("\n");
          } else {
            message = err.response.data.message;
          }
        } else if (err.response.data?.error) {
          message = err.response.data.error;
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      alert(`❌ Error:\n${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{id ? "Edit Product" : "Add New Product"}</h1>
        <Button variant="secondary" onClick={() => navigate("/products")} className="px-4 py-2 flex items-center">
          ← Back to Products
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <Formik initialValues={initialValues} validationSchema={ProductSchema} onSubmit={handleSubmit} enableReinitialize={!!id}>
          {({ isSubmitting, values, errors, touched }) => (
            <Form>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name && touched.name ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. Kaos Polos Premium"
                  />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Stock Keeping Unit)</span>
                  </label>
                  <Field
                    name="sku"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.sku && touched.sku ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. KP-001"
                  />
                  <ErrorMessage name="sku" component="p" className="text-red-500 text-sm mt-1" />
                  <p className="mt-1 text-xs text-gray-500">Must be unique (letters, numbers, hyphens only)</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Field name="category" type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" placeholder="e.g. Kaos, Celana" />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <Field name="size" type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" placeholder="e.g. S, M, L" />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <Field name="color" type="text" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" placeholder="e.g. Putih, Hitam" />
                </div>

                {/* HPP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HPP (Rp) <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Harga Pokok Produksi)</span>
                  </label>
                  <Field
                    name="hpp"
                    type="number"
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.hpp && touched.hpp ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. 25000"
                  />
                  <ErrorMessage name="hpp" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (Rp) <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="sellingPrice"
                    type="number"
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sellingPrice && touched.sellingPrice ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. 50000"
                  />
                  <ErrorMessage name="sellingPrice" component="p" className="text-red-500 text-sm mt-1" />
                  {values.hpp && values.sellingPrice && (
                    <p className={`mt-1 text-xs font-medium ${parseFloat(values.sellingPrice) > parseFloat(values.hpp) ? "text-green-600" : "text-red-600"}`}>
                      Profit: Rp {(parseFloat(values.sellingPrice) - parseFloat(values.hpp)).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="stock"
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock && touched.stock ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. 100"
                  />
                  <ErrorMessage name="stock" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Alert threshold)</span>
                  </label>
                  <Field
                    name="minStock"
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.minStock && touched.minStock ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. 10"
                  />
                  <ErrorMessage name="minStock" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Field name="description" as="textarea" rows="3" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" placeholder="e.g. Kaos polos premium bahan katun 100%" />
                  <p className="mt-1 text-xs text-gray-500">Optional product description</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                <Button type="button" variant="secondary" onClick={() => navigate("/products")} disabled={submitting} className="w-full sm:w-auto px-4 py-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:w-auto px-4 py-2">
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {id ? "Updating..." : "Creating..."}
                    </span>
                  ) : id ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProductForm;
