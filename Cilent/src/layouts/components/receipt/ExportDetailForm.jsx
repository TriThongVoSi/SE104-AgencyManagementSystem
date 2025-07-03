

// import React, { useState, useEffect, useContext } from 'react';
// import { addExportDetail } from '../../services/receiptService';
// import { ProductContext } from '../../App';
// import { toast } from 'react-toastify';

// const ExportDetailForm = ({ receiptId, receipt, onClose, onAddDetail }) => {
//   const { products, units } = useContext(ProductContext);
//   const [formData, setFormData] = useState({
//     exportReceiptID: receiptId,
//     productID: '',
//     unitID: '',
//     quantityExport: 0,
//     exportPrice: 0,
//     intoMoney: 0,
//   });
//   const [message, setMessage] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedFormData = { ...formData, [name]: value };
//     if (name === 'productID') {
//       const product = products.find(p => p.productID === parseInt(value));
//       if (product) {
//         updatedFormData.unitID = product.unit.unitID.toString();
//         updatedFormData.exportPrice = product.exportPrice;
//       }
//     }
//     if (name === 'quantityExport' || name === 'exportPrice') {
//       updatedFormData.intoMoney = Math.max(0, parseInt(updatedFormData.quantityExport || 0) * parseInt(updatedFormData.exportPrice || 0));
//     }
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.productID || !formData.unitID || !formData.quantityExport || !formData.exportPrice) {
//       setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
//       return;
//     }
//     try {
//       const detailData = {
//         exportReceiptID: { exportReceiptID: parseInt(formData.exportReceiptID) },
//         productID: { productID: parseInt(formData.productID) },
//         unitID: { unitID: parseInt(formData.unitID) },
//         quantityExport: parseInt(formData.quantityExport),
//         exportPrice: parseInt(formData.exportPrice),
//       };
//       const response = await addExportDetail(detailData);
//       const product = products.find(p => p.productID === parseInt(formData.productID));
//       const unit = units.find(u => u.unitID === parseInt(formData.unitID));
//       onAddDetail({
//         ...response.data,
//         productName: product.productName,
//         unitName: unit.unitName,
//       });
//       setMessage({ type: 'success', text: 'Thêm chi tiết xuất thành công!' });
//       setFormData({
//         exportReceiptID: receiptId,
//         productID: '',
//         unitID: '',
//         quantityExport: 0,
//         exportPrice: 0,
//         intoMoney: 0,
//       });
//     } catch (err) {
//       setMessage({ type: 'error', text: 'Lỗi khi thêm chi tiết xuất!' });
//     }
//   };

//   return (
//     <div className="p-6 bg-[#2a3b4c] rounded-lg shadow-lg">
//       <h3 className="text-xl font-semibold text-white mb-4">Thêm Chi Tiết Phiếu Xuất</h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-gray-300">Mã phiếu xuất</label>
//           <input
//             type="number"
//             name="exportReceiptID"
//             value={formData.exportReceiptID}
//             readOnly
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
//           />
//         </div>
//         {receipt && (
//           <>
//             <div>
//               <label className="block text-gray-300">Ngày lập phiếu</label>
//               <input
//                 type="text"
//                 value={new Date(receipt.dateReceipt).toLocaleDateString()}
//                 readOnly
//                 className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-300">Tổng tiền</label>
//               <input
//                 type="text"
//                 value={new Intl.NumberFormat('vi-VN').format(receipt.totalMoney) + ' đ'}
//                 readOnly
//                 className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
//               />
//             </div>
//           </>
//         )}
//         <div>
//           <label className="block text-gray-300">Sản phẩm</label>
//           <select
//             name="productID"
//             value={formData.productID}
//             onChange={handleChange}
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
//             required
//           >
//             <option value="">Chọn sản phẩm</option>
//             {products.map(product => (
//               <option key={product.productID} value={product.productID}>{product.productName}</option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-gray-300">Đơn vị tính</label>
//           <select
//             name="unitID"
//             value={formData.unitID}
//             onChange={handleChange}
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
//             required
//           >
//             <option value="">Chọn đơn vị</option>
//             {units.map(unit => (
//               <option key={unit.unitID} value={unit.unitID}>{unit.unitName}</option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-gray-300">Số lượng xuất</label>
//           <input
//             type="number"
//             name="quantityExport"
//             value={formData.quantityExport}
//             onChange={handleChange}
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-300">Giá xuất</label>
//           <input
//             type="number"
//             name="exportPrice"
//             value={formData.exportPrice}
//             onChange={handleChange}
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-300">Thành tiền</label>
//           <input
//             type="number"
//             name="intoMoney"
//             value={formData.intoMoney}
//             readOnly
//             className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
//           />
//         </div>
//         {message && (
//           <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
//             {message.text}
//           </div>
//         )}
//         <div className="flex space-x-4">
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
//             Thêm chi tiết
//           </button>
//           <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
//             Hủy
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ExportDetailForm;


import React, { useState, useEffect, useContext } from 'react';
import { addExportDetail, getInventoryQuantity } from '../../../utils/receiptService';
import { ProductContext } from '../../../App';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const ExportDetailForm = ({ receiptId, receipt, onClose, onAddDetail }) => {
  const { products, units } = useContext(ProductContext);
  const [formData, setFormData] = useState({
    exportReceiptID: receiptId,
    productID: '',
    unitID: '',
    quantityExport: '',
    exportPrice: 0,
    intoMoney: 0,
  });
  const [message, setMessage] = useState(null);

  const handleChangeDetail = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    if (name === 'productID') {
      const product = products.find(p => p.productID === parseInt(value));
      if (product) {
        updatedFormData.unitID = product.unit.unitID.toString();
        updatedFormData.exportPrice = product.exportPrice;
      }
    }
    if (name === 'quantityExport' || name === 'exportPrice') {
      updatedFormData.intoMoney = Math.max(0, parseInt(updatedFormData.quantityExport || 0) * parseInt(updatedFormData.exportPrice || 0));
    }
    setFormData(updatedFormData);
  };

  const handleSubmitDetail = async (e) => {
    e.preventDefault();
    if (!formData.productID || !formData.unitID || !formData.quantityExport || !formData.exportPrice) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }
    const product = products.find(p => p.productID === parseInt(formData.productID));
    if (!product) {
      setMessage({ type: 'error', text: 'Sản phẩm không tồn tại!' });
      return;
    }
    // Kiểm tra tồn kho
    try {
      const inventoryResponse = await getInventoryQuantity(product.productName);
      const availableQuantity = inventoryResponse.data.inventoryQuantity;
      if (parseInt(formData.quantityExport) > availableQuantity) {
        setMessage({ type: 'error', text: `Số lượng xuất (${formData.quantityExport}) vượt quá tồn kho (${availableQuantity})!` });
        return;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi kiểm tra tồn kho!' });
      return;
    }
    try {
      const detailData = {
        exportReceiptID: { exportReceiptID: parseInt(formData.exportReceiptID) },
        productID: { productID: parseInt(formData.productID) },
        unitID: { unitID: parseInt(formData.unitID) },
        quantityExport: parseInt(formData.quantityExport),
        exportPrice: parseInt(formData.exportPrice),
      };
      const response = await addExportDetail(detailData);
      const unit = units.find(u => u.unitID === parseInt(formData.unitID));
      onAddDetail({
        ...response.data,
        productName: product.productName,
        unitName: unit.unitName,
      });
      setMessage({ type: 'success', text: 'Thêm chi tiết xuất thành công!' });
      toast.success('Thêm chi tiết xuất thành công!');
      setFormData({
        exportReceiptID: receiptId,
        productID: '',
        unitID: '',
        quantityExport: '',
        exportPrice: 0,
        intoMoney: 0,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi thêm chi tiết xuất!' });
      toast.error('Lỗi khi thêm chi tiết xuất!');
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-yellow-400">Thêm Chi Tiết Phiếu Xuất</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
          <FaTimes size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmitDetail} className="space-y-4">
        <div>
          <label className="block text-gray-300">Mã phiếu xuất</label>
          <input
            type="number"
            name="exportReceiptID"
            value={formData.exportReceiptID}
            readOnly
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
          />
        </div>
        {receipt && (
          <>
            <div>
              <label className="block text-gray-300">Ngày lập phiếu</label>
              <input
                type="text"
                value={new Date(receipt.dateReceipt).toLocaleDateString()}
                readOnly
                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-300">Tổng tiền</label>
              <input
                type="text"
                value={new Intl.NumberFormat('vi-VN').format(receipt.totalPrice || 0) + ' đ'}
                readOnly
                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-gray-300">Sản phẩm</label>
          <select
            name="productID"
            value={formData.productID}
            onChange={handleChangeDetail}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            required
          >
            <option value="">Chọn sản phẩm</option>
            {products.map(product => (
              <option key={product.productID} value={product.productID}>{product.productName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Đơn vị tính</label>
          <select
            name="unitID"
            value={formData.unitID}
            onChange={handleChangeDetail}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            required
          >
            <option value="">Chọn đơn vị</option>
            {units.map(unit => (
              <option key={unit.unitID} value={unit.unitID}>{unit.unitName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Số lượng xuất</label>
          <input
            type="number"
            name="quantityExport"
            value={formData.quantityExport}
            onChange={handleChangeDetail}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-300">Giá xuất</label>
          <input
            type="number"
            name="exportPrice"
            value={formData.exportPrice}
            onChange={handleChangeDetail}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-gray-300">Thành tiền</label>
          <input
            type="number"
            name="intoMoney"
            value={formData.intoMoney}
            readOnly
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
          />
        </div>
        {message && (
          <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
          </div>
        )}
        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Thêm chi tiết
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExportDetailForm;