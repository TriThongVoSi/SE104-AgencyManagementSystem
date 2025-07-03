
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductContext } from '../../../App';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Products from context:', products); // Debug
    setLoading(true); // Bắt đầu loading
    const foundProduct = products.find(p => p.productID === parseInt(id));
    setProduct(foundProduct || null);
    setLoading(false); // Kết thúc loading
  }, [id, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-300">
        <div>
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm với ID {id} không tồn tại. Vui lòng kiểm tra lại.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 w-full max-w-2xl rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Chi tiết sản phẩm</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300"><strong>Mã sản phẩm:</strong></p>
            <p className="text-lg">{product.productID}</p>
          </div>
          <div>
            <p className="text-gray-300"><strong>Tên sản phẩm:</strong></p>
            <p className="text-lg">{product.productName}</p>
          </div>
          <div>
            <p className="text-gray-300"><strong>Đơn vị:</strong></p>
            <p className="text-lg">{product.unit.unitName}</p>
          </div>
          <div>
            <p className="text-gray-300"><strong>Giá nhập:</strong></p>
            <p className="text-lg">{new Intl.NumberFormat('vi-VN').format(product.importPrice)} đ</p>
          </div>
          <div>
            <p className="text-gray-300"><strong>Giá xuất:</strong></p>
            <p className="text-lg">{new Intl.NumberFormat('vi-VN').format(product.exportPrice)} đ</p>
          </div>
          <div>
            <p className="text-gray-300"><strong>Số lượng tồn kho:</strong></p>
            <p className="text-lg">{product.inventoryQuantity}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;