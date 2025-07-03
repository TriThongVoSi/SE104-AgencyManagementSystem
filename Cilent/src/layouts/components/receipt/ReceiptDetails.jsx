import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReceiptContext } from "../../../App";
import { getImportReceiptById, getImportDetailByReceiptId } from "../../../utils/receiptService";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ReceiptDetails = () => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const { receipts } = useContext(ReceiptContext);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchReceiptDetails = async () => {
      try {
        const receiptResponse = await getImportReceiptById(receiptId);
        const detailsResponse = await getImportDetailByReceiptId(receiptId);
        setReceipt({ ...receiptResponse.data, details: detailsResponse.data });
      } catch (err) {
        toast.error("Lỗi khi tải chi tiết phiếu nhập!");
      }
    };
    fetchReceiptDetails();
  }, [receiptId]);

  const exportToExcel = () => {
    if (!receipt) return;
    const worksheetData = receipt.details.map((item, index) => ({
      STT: index + 1,
      "Mặt Hàng": item.productName,
      "Đơn Vị Tính": item.unitName,
      "Số Lượng": item.quantityImport,
      "Đơn Giá": `${new Intl.NumberFormat("vi-VN").format(item.importPrice)} đ`,
      "Thành Tiền": `${new Intl.NumberFormat("vi-VN").format(item.intoMoney)} đ`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReceiptDetails");
    XLSX.writeFile(workbook, `Receipt_${receiptId}.xlsx`);
    toast.success("Xuất Excel thành công!");
  };

  const exportToPDF = () => {
    if (!receipt) return;
    const doc = new jsPDF();
    doc.text(`Chi Tiết Phiếu Nhập ID ${receiptId}`, 10, 10);
    doc.autoTable({
      head: [["STT", "Mặt Hàng", "Đơn Vị Tính", "Số Lượng", "Đơn Giá", "Thành Tiền"]],
      body: receipt.details.map((item, index) => [
        index + 1,
        item.productName,
        item.unitName,
        item.quantityImport,
        `${new Intl.NumberFormat("vi-VN").format(item.importPrice)} đ`,
        `${new Intl.NumberFormat("vi-VN").format(item.intoMoney)} đ`,
      ]),
    });
    doc.save(`Receipt_${receiptId}.pdf`);
    toast.success("Xuất PDF thành công!");
  };

  if (!receipt) {
    return (
      <div className="p-6 text-red-300 bg-gray-900 min-h-screen">
        Không tìm thấy phiếu. Vui lòng kiểm tra lại ID hoặc thêm phiếu mới.
      </div>
    );
  }

  const totalMoney = receipt.details.reduce((sum, item) => sum + item.intoMoney, 0) || 0;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-yellow-400">Chi Tiết Phiếu Nhập</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
          <div className="flex justify-between text-gray-300">
            <div>
              <label className="block">Số phiếu:</label>
              <input
                type="text"
                value={receipt.importReceiptID}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
            <div>
              <label className="block">Ngày lập phiếu:</label>
              <input
                type="text"
                value={new Date(receipt.dateReceipt).toLocaleDateString()}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800 text-gray-300">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mặt Hàng</th>
                <th className="py-3 px-4">Đơn Vị Tính</th>
                <th className="py-3 px-4">Số Lượng</th>
                <th className="py-3 px-4">Đơn Giá</th>
                <th className="py-3 px-4">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipt.details.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3">{item.unitName}</td>
                  <td className="px-4 py-3">{item.quantityImport}</td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("vi-VN").format(item.importPrice)} đ
                  </td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("vi-VN").format(item.intoMoney)} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-800 p-4 rounded-b-lg border-t border-gray-700 mt-4">
          <div className="flex justify-between text-gray-300">
            <div>
              <label className="block">Tổng tiền:</label>
              <input
                type="text"
                value={new Intl.NumberFormat("vi-VN").format(totalMoney) + " đ"}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Quay lại
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Xuất Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetails;