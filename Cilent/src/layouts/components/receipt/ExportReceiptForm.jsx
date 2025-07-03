import React, { useState, useEffect, useContext } from 'react';
import { addExportReceipt, getInventoryQuantity } from '../../../utils/receiptService';
import { getAllAgents } from '../../../utils/receiptService';
import { ProductContext } from '../../../App';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const ExportReceiptForm = ({ onCancel, onSuccess }) => {
  const { products, units } = useContext(ProductContext);
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    dateReceipt: new Date().toISOString().split('T')[0],
    agentID: '',
    details: [],
    totalMoney: 0,
    paymentAmount: 0,
    remainAmount: 0,
  });
  const [errors, setErrors] = useState({});
  const [currentDetail, setCurrentDetail] = useState({
    productID: '',
    quantityExport: '',
    exportPrice: '',
    unitID: '',
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await getAllAgents();
        setAgents(response.data);
      } catch (err) {
        toast.error('Lỗi khi tải danh sách đại lý!');
      }
    };
    fetchAgents();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dateReceipt) newErrors.dateReceipt = 'Ngày lập phiếu không được để trống';
    if (!formData.agentID) newErrors.agentID = 'Vui lòng chọn đại lý';
    if (formData.details.length === 0) newErrors.details = 'Phải có ít nhất một mặt hàng';
    if (formData.totalMoney <= 0) newErrors.totalMoney = 'Tổng tiền phải lớn hơn 0';
    if (formData.paymentAmount < 0) newErrors.paymentAmount = 'Số tiền trả không được âm';
    return newErrors;
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
        updatedDetail.exportPrice = product.exportPrice;
      }
    }
    setCurrentDetail(updatedDetail);
  };

  const addDetail = async () => {
    if (!currentDetail.productID || !currentDetail.quantityExport || !currentDetail.exportPrice || !currentDetail.unitID) {
      toast.error('Vui lòng điền đầy đủ thông tin mặt hàng!');
      return;
    }
    const product = products.find(p => p.productID === parseInt(currentDetail.productID));
    const unit = units.find(u => u.unitID === parseInt(currentDetail.unitID));
    if (!product || !unit) {
      toast.error('Sản phẩm hoặc đơn vị không tồn tại!');
      return;
    }
    // Kiểm tra tồn kho
    try {
      const inventoryResponse = await getInventoryQuantity(product.productName);
      const availableQuantity = inventoryResponse.data.inventoryQuantity;
      if (parseInt(currentDetail.quantityExport) > availableQuantity) {
        toast.error(`Số lượng xuất (${currentDetail.quantityExport}) vượt quá tồn kho (${availableQuantity})!`);
        return;
      }
    } catch (err) {
      toast.error('Lỗi khi kiểm tra tồn kho!');
      return;
    }
    const newDetail = {
      productID: { productID: parseInt(currentDetail.productID) },
      unitID: { unitID: parseInt(currentDetail.unitID) },
      quantityExport: parseInt(currentDetail.quantityExport),
      exportPrice: parseInt(currentDetail.exportPrice),
      intoMoney: parseInt(currentDetail.quantityExport) * parseInt(currentDetail.exportPrice),
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
    setCurrentDetail({ productID: '', quantityExport: '', exportPrice: '', unitID: '' });
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
        agentID: { agentID: parseInt(formData.agentID) },
        dateReceipt: formData.dateReceipt,
        totalMoney: parseInt(formData.totalMoney),
        paymentAmount: parseInt(formData.paymentAmount),
        remainAmount: parseInt(formData.remainAmount),
        details: formData.details.map(detail => ({
          productID: detail.productID,
          unitID: detail.unitID,
          quantityExport: detail.quantityExport,
          exportPrice: detail.exportPrice,
        })),
      };
      await addExportReceipt(receiptData);
      toast.success('Thêm phiếu xuất thành công!');
      onSuccess();
    } catch (err) {
      toast.error('Lỗi khi thêm phiếu xuất!');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white mb-6">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">Thêm Phiếu Xuất Mới</h2>
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
          <label className="block text-gray-300">Đại lý</label>
          <select
            name="agentID"
            value={formData.agentID}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
          >
            <option value="">Chọn đại lý</option>
            {agents.map(agent => (
              <option key={agent.agentID} value={agent.agentID}>{agent.agentName}</option>
            ))}
          </select>
          {errors.agentID && <p className="text-red-400 text-sm mt-1">{errors.agentID}</p>}
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
                name="quantityExport"
                value={currentDetail.quantityExport}
                onChange={handleDetailChange}
                placeholder="Số lượng"
                className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Giá xuất</label>
              <input
                type="number"
                name="exportPrice"
                value={currentDetail.exportPrice}
                onChange={handleDetailChange}
                placeholder="Giá xuất"
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
                  <th className="py-3 px-4">Giá xuất</th>
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
                    <td className="px-4 py-3">{detail.quantityExport}</td>
                    <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(detail.exportPrice)} đ</td>
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
    </div>
  );
};

export default ExportReceiptForm;