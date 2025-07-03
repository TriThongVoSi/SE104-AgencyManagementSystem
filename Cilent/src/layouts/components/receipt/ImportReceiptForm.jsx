import React, { useState, useEffect, useContext } from 'react';
import { addImportReceipt, getAllSuppliers, createImportReceipt } from '../../../utils/receiptService';
import { ProductContext } from '../../../App';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const ImportReceiptForm = ({ onCancel, onSuccess }) => {
  const { products, units } = useContext(ProductContext);
  const [suppliers, setSuppliers] = useState([]);
  const [showSimpleForm, setShowSimpleForm] = useState(false);
  
  // Form data cho phiếu nhập đơn giản theo API mới
  const [simpleFormData, setSimpleFormData] = useState({
    createDate: new Date().toISOString().split('T')[0],
    productID: '',
    unitID: '',
    quantityImport: 0,
  });
  
  const [formData, setFormData] = useState({
    dateReceipt: new Date().toISOString().split('T')[0],
    supplierID: '',
    details: [],
    totalMoney: 0,
    paymentAmount: 0,
    remainAmount: 0,
  });
  const [errors, setErrors] = useState({});
  const [currentDetail, setCurrentDetail] = useState({
    productID: '',
    quantityImport: '',
    importPrice: '',
    unitID: '',
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await getAllSuppliers();
        setSuppliers(response.data);
      } catch (err) {
        toast.error('Lỗi khi tải danh sách nhà cung cấp!');
      }
    };
    fetchSuppliers();
  }, []);

  // Validate form cho phiếu nhập đơn giản
  const validateSimpleForm = () => {
    const newErrors = {};
    if (!simpleFormData.createDate) newErrors.createDate = 'Ngày tạo không được để trống';
    if (!simpleFormData.productID) newErrors.productID = 'Vui lòng chọn sản phẩm';
    if (!simpleFormData.unitID) newErrors.unitID = 'Vui lòng chọn đơn vị tính';
    if (!simpleFormData.quantityImport || simpleFormData.quantityImport <= 0) newErrors.quantityImport = 'Số lượng nhập phải lớn hơn 0';
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dateReceipt) newErrors.dateReceipt = 'Ngày lập phiếu không được để trống';
    if (!formData.supplierID) newErrors.supplierID = 'Vui lòng chọn nhà cung cấp';
    if (formData.details.length === 0) newErrors.details = 'Phải có ít nhất một mặt hàng';
    if (formData.totalMoney <= 0) newErrors.totalMoney = 'Tổng tiền phải lớn hơn 0';
    if (formData.paymentAmount < 0) newErrors.paymentAmount = 'Số tiền trả không được âm';
    return newErrors;
  };

  // Xử lý submit form đơn giản
  const handleSimpleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateSimpleForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const requestData = {
        createDate: simpleFormData.createDate,
        productID: parseInt(simpleFormData.productID),
        unitID: parseInt(simpleFormData.unitID),
        quantityImport: parseInt(simpleFormData.quantityImport),
      };

      const result = await createImportReceipt(requestData);
      
      if (result.code === 201 && result.status === 'success') {
        toast.success(result.message || 'Tạo phiếu nhập hàng thành công!');
        
        // Reset form
        setSimpleFormData({
          createDate: new Date().toISOString().split('T')[0],
          productID: '',
          unitID: '',
          quantityImport: 0,
        });
        setErrors({});
        
        // Gọi callback success để refresh danh sách
        onSuccess(result.data);
      } else {
        toast.error('Có lỗi khi tạo phiếu nhập hàng!');
      }
    } catch (err) {
      toast.error('Lỗi khi tạo phiếu nhập hàng!');
      console.error(err);
    }
  };

  // Handle change cho simple form
  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setSimpleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    updatedFormData.remainAmount = Math.max(0, parseInt(updatedFormData.totalMoney || 0) - parseInt(updatedFormData.paymentAmount || 0));
    setFormData(updatedFormData);
    setErrors({ ...errors, [name]: null });
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    const updatedDetail = { ...currentDetail, [name]: value };
    if (name === 'productID') {
      const product = products.find(p => p.productID === parseInt(value));
      if (product) {
        updatedDetail.unitID = product.unit.unitID.toString();
        updatedDetail.importPrice = product.importPrice || 0;
      }
    }
    setCurrentDetail(updatedDetail);
  };

  const addDetail = () => {
    if (!currentDetail.productID || !currentDetail.quantityImport || !currentDetail.importPrice || !currentDetail.unitID) {
      toast.error('Vui lòng điền đầy đủ thông tin mặt hàng!');
      return;
    }
    const product = products.find(p => p.productID === parseInt(currentDetail.productID));
    const unit = units.find(u => u.unitID === parseInt(currentDetail.unitID));
    if (!product || !unit) {
      toast.error('Sản phẩm hoặc đơn vị không tồn tại!');
      return;
    }
    const newDetail = {
      productID: { productID: parseInt(currentDetail.productID) },
      unitID: { unitID: parseInt(currentDetail.unitID) },
      quantityImport: parseInt(currentDetail.quantityImport),
      importPrice: parseInt(currentDetail.importPrice),
      intoMoney: parseInt(currentDetail.quantityImport) * parseInt(currentDetail.importPrice),
      productName: product.productName,
      unitName: unit.unitName,
    };
    const updatedDetails = [...formData.details, newDetail];
    const newTotalMoney = updatedDetails.reduce((sum, d) => sum + d.intoMoney, 0);
    setFormData({
      ...formData,
      details: updatedDetails,
      totalMoney: newTotalMoney,
      remainAmount: newTotalMoney - parseInt(formData.paymentAmount || 0),
    });
    setCurrentDetail({ productID: '', quantityImport: '', importPrice: '', unitID: '' });
  };

  const removeDetail = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    const newTotalMoney = updatedDetails.reduce((sum, d) => sum + d.intoMoney, 0);
    setFormData({
      ...formData,
      details: updatedDetails,
      totalMoney: newTotalMoney,
      remainAmount: newTotalMoney - parseInt(formData.paymentAmount || 0),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      const receiptData = {
        supplierID: { supplierID: parseInt(formData.supplierID) },
        dateReceipt: formData.dateReceipt,
        totalMoney: parseInt(formData.totalMoney),
        paymentAmount: parseInt(formData.paymentAmount),
        remainAmount: parseInt(formData.remainAmount),
        details: formData.details.map(detail => ({
          productID: detail.productID,
          unitID: detail.unitID,
          quantityImport: detail.quantityImport,
          importPrice: detail.importPrice,
        })),
      };
      await addImportReceipt(receiptData);
      toast.success('Thêm phiếu nhập thành công!');
      onSuccess();
    } catch (err) {
      toast.error('Lỗi khi thêm phiếu nhập!');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          {showSimpleForm ? 'Tạo Phiếu Nhập Mới (API)' : 'Thêm Phiếu Nhập Mới'}
        </h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowSimpleForm(!showSimpleForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
          >
            {showSimpleForm ? 'Form Cũ' : 'Form API Mới'}
          </button>
        </div>
      </div>

      {showSimpleForm ? (
        // Form đơn giản theo API mới
        <form onSubmit={handleSimpleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Ngày tạo phiếu</label>
            <input
              type="date"
              name="createDate"
              value={simpleFormData.createDate}
              onChange={handleSimpleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
            />
            {errors.createDate && (
              <p className="text-red-400 text-sm mt-1">{errors.createDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Sản phẩm</label>
            <select
              name="productID"
              value={simpleFormData.productID}
              onChange={handleSimpleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.productID} value={product.productID}>
                  {product.productName}
                </option>
              ))}
            </select>
            {errors.productID && (
              <p className="text-red-400 text-sm mt-1">{errors.productID}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Đơn vị tính</label>
            <select
              name="unitID"
              value={simpleFormData.unitID}
              onChange={handleSimpleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
            >
              <option value="">Chọn đơn vị tính</option>
              {units.map((unit) => (
                <option key={unit.unitID} value={unit.unitID}>
                  {unit.unitName}
                </option>
              ))}
            </select>
            {errors.unitID && (
              <p className="text-red-400 text-sm mt-1">{errors.unitID}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Số lượng nhập</label>
            <input
              type="number"
              name="quantityImport"
              value={simpleFormData.quantityImport}
              onChange={handleSimpleChange}
              min="0"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-white"
            />
            {errors.quantityImport && (
              <p className="text-red-400 text-sm mt-1">{errors.quantityImport}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Tạo Phiếu Nhập
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300">Ngày lập phiếu</label>
            <input
              type="date"
              name="dateReceipt"
              value={formData.dateReceipt}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            />
            {errors.dateReceipt && <p className="text-red-400 text-sm mt-1">{errors.dateReceipt}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Nhà cung cấp</label>
            <select
              name="supplierID"
              value={formData.supplierID}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplierID} value={supplier.supplierID}>{supplier.supplierName}</option>
              ))}
            </select>
            {errors.supplierID && <p className="text-red-400 text-sm mt-1">{errors.supplierID}</p>}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Thêm mặt hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-gray-300">Sản phẩm</label>
                <select
                  name="productID"
                  value={currentDetail.productID}
                  onChange={handleDetailChange}
                  className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.productID} value={product.productID}>{product.productName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300">Đơn vị</label>
                <select
                  name="unitID"
                  value={currentDetail.unitID}
                  onChange={handleDetailChange}
                  className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                >
                  <option value="">Chọn đơn vị</option>
                  {units.map(unit => (
                    <option key={unit.unitID} value={unit.unitID}>{unit.unitName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300">Số lượng</label>
                <input
                  type="number"
                  name="quantityImport"
                  value={currentDetail.quantityImport}
                  onChange={handleDetailChange}
                  placeholder="Số lượng"
                  className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Giá nhập</label>
                <input
                  type="number"
                  name="importPrice"
                  value={currentDetail.importPrice}
                  onChange={handleDetailChange}
                  placeholder="Giá nhập"
                  className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addDetail}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  + Thêm
                </button>
              </div>
            </div>
            {errors.details && <p className="text-red-400 text-sm mt-1">{errors.details}</p>}
          </div>
          {formData.details.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Danh sách mặt hàng</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800 text-gray-300">
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Đơn vị</th>
                    <th className="py-3 px-4">Số lượng</th>
                    <th className="py-3 px-4">Giá nhập</th>
                    <th className="py-3 px-4">Thành tiền</th>
                    <th className="py-3 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.details.map((detail, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{detail.productName}</td>
                      <td className="px-4 py-3">{detail.unitName}</td>
                      <td className="px-4 py-3">{detail.quantityImport}</td>
                      <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(detail.importPrice)} đ</td>
                      <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(detail.intoMoney)} đ</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div>
            <label className="block text-gray-300">Tổng tiền</label>
            <input
              type="number"
              name="totalMoney"
              value={formData.totalMoney}
              readOnly
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
            />
            {errors.totalMoney && <p className="text-red-400 text-sm mt-1">{errors.totalMoney}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Số tiền trả</label>
            <input
              type="number"
              name="paymentAmount"
              value={formData.paymentAmount}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
              min="0"
            />
            {errors.paymentAmount && <p className="text-red-400 text-sm mt-1">{errors.paymentAmount}</p>}
          </div>
          <div>
            <label className="block text-gray-300">Còn lại</label>
            <input
              type="number"
              name="remainAmount"
              value={formData.remainAmount}
              readOnly
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white cursor-not-allowed"
            />
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Thêm phiếu
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ImportReceiptForm;