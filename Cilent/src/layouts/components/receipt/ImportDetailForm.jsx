import React, { useState, useEffect, useContext } from "react";
import { ProductContext } from "../../../App";
import { addImportDetail } from "../../../utils/receiptService";
import { toast } from "react-toastify";

const ImportDetailForm = ({ receiptId, receipt, onClose, onAddDetail }) => {
  const { products, units } = useContext(ProductContext);
  const [formData, setFormData] = useState({
    importReceiptID: receiptId,
    productID: "",
    unitID: "",
    quantityImport: 0,
    importPrice: 0,
  });
  const [message, setMessage] = useState(null);
  const [productIndex, setProductIndex] = useState(
    (receipt?.details?.length || 0) + 1
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      importReceiptID: receiptId,
      productID: "",
      unitID: "",
    }));
  }, [receiptId, productIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.productID ||
      !formData.unitID ||
      !formData.quantityImport ||
      !formData.importPrice
    ) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    try {
      const detailData = [
        {
          importReceiptID: { importReceiptID: parseInt(formData.importReceiptID) },
          productID: { productID: parseInt(formData.productID) },
          unitID: { unitID: parseInt(formData.unitID) },
          quantityImport: parseInt(formData.quantityImport),
          importPrice: parseInt(formData.importPrice),
        },
      ];

      const response = await addImportDetail(detailData);
      if (response.status === "CREATED") {
        const newDetail = response.data[0];
        onAddDetail(newDetail);
        setMessage({ type: "success", text: "Thêm chi tiết nhập thành công!" });
        setFormData({
          importReceiptID: receiptId,
          productID: "",
          unitID: "",
          quantityImport: 0,
          importPrice: 0,
        });
        setProductIndex((prev) => prev + 1);
        toast.success("Thêm chi tiết nhập thành công!");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Thêm chi tiết nhập thất bại!" });
      toast.error("Thêm chi tiết nhập thất bại!");
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
      <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
        Thêm Chi Tiết Phiếu Nhập
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300">Mã phiếu nhập</label>
          <input
            type="number"
            name="importReceiptID"
            value={formData.importReceiptID}
            readOnly
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
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
                className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-gray-300">Tổng giá</label>
              <input
                type="text"
                value={new Intl.NumberFormat("vi-VN").format(receipt.totalPrice) + " đ"}
                readOnly
                className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-gray-300">Sản phẩm</label>
          <select
            name="productID"
            value={formData.productID}
            onChange={handleChange}
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.productID} value={product.productID}>
                {product.productName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Đơn vị tính</label>
          <select
            name="unitID"
            value={formData.unitID}
            onChange={handleChange}
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
          >
            <option value="">Chọn đơn vị</option>
            {units.map((unit) => (
              <option key={unit.unitID} value={unit.unitID}>
                {unit.unitName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300">Số lượng nhập</label>
          <input
            type="number"
            name="quantityImport"
            value={formData.quantityImport}
            onChange={handleChange}
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300">Giá nhập</label>
          <input
            type="number"
            name="importPrice"
            value={formData.importPrice}
            onChange={handleChange}
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300">Thành tiền</label>
          <input
            type="number"
            value={formData.quantityImport * formData.importPrice || 0}
            readOnly
            className="border border-gray-600 p-2 w-full bg-gray-800 text-white rounded-md bg-gray-700"
          />
        </div>
        {message && (
          <div
            className={`p-2 rounded ${
              message.type === "success"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Thêm chi tiết
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportDetailForm;