import React, { useState, useEffect, useContext } from 'react';
import CategoryManagement from '../layouts/components/product/ProductList';
import ProductForm from '../layouts/components/product/ProductForm';
import ErrorBoundary from '../layouts/components/ErrorBoundary';
import { ProductContext } from '../App';
import { getAllProducts } from '../utils/productService';
import { toast } from 'react-toastify';

const ProductManagement = () => {
  const { products, updateProducts } = useContext(ProductContext);
  const [localProducts, setLocalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Fetch products from database when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getAllProducts();
        console.log('🔍 Products API response:', result);
        
        if (result.data) {
          // Transform data để phù hợp với format UI cần
          const transformedProducts = result.data.map(product => ({
            productID: product.productID,
            productName: product.productName,
            unit: { unitName: product.unit },
            importPrice: product.importPrice,
            exportPrice: product.exportPrice,
            inventoryQuantity: product.inventoryQuantity,
          }));
          
          setLocalProducts(transformedProducts);
          updateProducts(transformedProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Lỗi khi tải danh sách sản phẩm: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array - chỉ chạy 1 lần khi component mount

  useEffect(() => {
    // Cập nhật localProducts khi products từ context thay đổi
    if (products.length > 0) {
      setLocalProducts([...products]);
    }
  }, [products]);

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSetProducts = (newProducts) => {
    setLocalProducts([...newProducts]);
    updateProducts([...newProducts]);
  };

  const refreshProducts = async () => {
    try {
      const result = await getAllProducts();
      if (result.data) {
        const transformedProducts = result.data.map(product => ({
          productID: product.productID,
          productName: product.productName,
          unit: { unitName: product.unit },
          importPrice: product.importPrice,
          exportPrice: product.exportPrice,
          inventoryQuantity: product.inventoryQuantity,
        }));
        
        setLocalProducts(transformedProducts);
        updateProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error refreshing products:', err);
      toast.error('Lỗi khi làm mới danh sách sản phẩm: ' + err.message);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-300">Đang tải danh sách sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-900 min-h-screen text-white">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Quản lý danh mục</h1>
        {showForm && (
          <ErrorBoundary>
            <ProductForm
              onCancel={handleCancel}
              setShowForm={setShowForm}
              products={localProducts}
              setProducts={handleSetProducts}
              onRefresh={refreshProducts}
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <CategoryManagement
            products={localProducts}
            setProducts={handleSetProducts}
            onShowForm={handleShowForm}
            onRefresh={refreshProducts}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ProductManagement;