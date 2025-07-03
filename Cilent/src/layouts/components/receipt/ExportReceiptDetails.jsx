// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getExportReceiptById, getExportDetailByReceiptId } from '../../services/receiptService';
// import { toast } from 'react-toastify';

// const ExportReceiptDetails = () => {
//   const { receiptId } = useParams();
//   const navigate = useNavigate();
//   const [receipt, setReceipt] = useState(null);

//   useEffect(() => {
//     const fetchReceiptDetails = async () => {
//       try {
//         const receiptResponse = await getExportReceiptById(receiptId);
//         const detailsResponse = await getExportDetailByReceiptId(receiptId);
//         setReceipt({ ...receiptResponse.data, details: detailsResponse.data });
//       } catch (err) {
//         toast.error('Lỗi khi tải chi tiết phiếu xuất!');
//       }
//     };
//     fetchReceiptDetails();
//   }, [receiptId]);

//   const handleExport = () => {
//     toast.success(`Xuất file Phiếu Xuất ID ${receiptId} thành công! (Chức năng mô phỏng)`);
//   };

//   if (!receipt) {
//     return (
//       <div className="p-6 text-red-300">
//         Không tìm thấy phiếu. Vui lòng kiểm tra lại ID hoặc thêm phiếu mới.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-800 text-white min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-blue-400">Chi tiết phiếu xuất</h2>
//       <div className="bg-gray-700 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
//         <div className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
//           <div className="flex justify-between text-gray-300">
//             <div>
//               <label className="block">Số phiếu:</label>
//               <input
//                 type="text"
//                 value={receipt.exportReceiptID}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block">Ngày lập phiếu:</label>
//               <input
//                 type="text"
//                 value={new Date(receipt.dateReceipt).toLocaleDateString()}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block">Đại lý:</label>
//               <input
//                 type="text"
//                 value={receipt.agentName}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="overflow-x-auto mt-4">
//           <table className="min-w-full divide-y divide-gray-700">
//             <thead className="bg-gray-600 text-gray-300">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">STT</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mặt hàng</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Đơn vị tính</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Số lượng</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Đơn giá</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Thành tiền</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-700 text-gray-200">
//               {receipt.details.map((item, index) => (
//                 <tr key={index} className="border-t border-gray-700">
//                   <td className="px-4 py-3">{index + 1}</td>
//                   <td className="px-4 py-3">{item.productName}</td>
//                   <td className="px-4 py-3">{item.unitName}</td>
//                   <td className="px-4 py-3">{item.quantityExport}</td>
//                   <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(item.exportPrice)} đ</td>
//                   <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(item.intoMoney)} đ</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div className="bg-gray-800 p-4 rounded-b-lg border-t border-gray-700 mt-4">
//           <div className="flex justify-between text-gray-300">
//             <div>
//               <label className="block">Tổng tiền:</label>
//               <input
//                 type="text"
//                 value={new Intl.NumberFormat('vi-VN').format(receipt.totalMoney) + ' đ'}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block">Số tiền trả:</label>
//               <input
//                 type="text"
//                 value={new Intl.NumberFormat('vi-VN').format(receipt.paymentAmount) + ' đ'}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//             <div>
//               <label className="block">Số tiền nợ:</label>
//               <input
//                 type="text"
//                 value={new Intl.NumberFormat('vi-VN').format(receipt.remainAmount) + ' đ'}
//                 readOnly
//                 className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-end mt-4 space-x-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
//           >
//             Quay lại
//           </button>
//           <button
//             onClick={handleExport}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
//           >
//             Xuất file (PDF/XLSX)
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExportReceiptDetails;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExportReceiptById } from '../../../utils/receiptService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ExportReceiptDetails = () => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchReceiptDetails = async () => {
      try {
        const receiptResponse = await getExportReceiptById(receiptId);
        setReceipt({ ...receiptResponse.data, details: receiptResponse.data.details || [] });
      } catch (err) {
        toast.error('Lỗi khi tải chi tiết phiếu xuất!');
      }
    };
    fetchReceiptDetails();
  }, [receiptId]);

  const exportToExcel = () => {
    if (!receipt) return;
    const worksheetData = receipt.details.map((item, index) => ({
      STT: index + 1,
      'Mặt Hàng': item.productName,
      'Đơn Vị Tính': item.unitName,
      'Số Lượng': item.quantityExport,
      'Đơn Giá': `${new Intl.NumberFormat('vi-VN').format(item.exportPrice)} đ`,
      'Thành Tiền': `${new Intl.NumberFormat('vi-VN').format(item.intoMoney)} đ`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ExportReceiptDetails');
    XLSX.writeFile(workbook, `ExportReceipt_${receiptId}.xlsx`);
    toast.success('Xuất Excel thành công!');
  };

  const exportToPDF = () => {
    if (!receipt) return;
    const doc = new jsPDF();
    doc.text(`Chi Tiết Phiếu Xuất ID ${receiptId}`, 10, 10);
    doc.autoTable({
      head: [['STT', 'Mặt Hàng', 'Đơn Vị Tính', 'Số Lượng', 'Đơn Giá', 'Thành Tiền']],
      body: receipt.details.map((item, index) => [
        index + 1,
        item.productName,
        item.unitName,
        item.quantityExport,
        `${new Intl.NumberFormat('vi-VN').format(item.exportPrice)} đ`,
        `${new Intl.NumberFormat('vi-VN').format(item.intoMoney)} đ`,
      ]),
    });
    doc.save(`ExportReceipt_${receiptId}.pdf`);
    toast.success('Xuất PDF thành công!');
  };

  if (!receipt) {
    return (
      <div className="p-6 text-red-300 bg-gray-900 min-h-screen">
        Không tìm thấy phiếu. Vui lòng kiểm tra lại ID hoặc thêm phiếu mới.
      </div>
    );
  }

  const totalMoney = receipt.totalPrice || receipt.details.reduce((sum, item) => sum + item.intoMoney, 0) || 0;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-yellow-400">Chi Tiết Phiếu Xuất</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
          <div className="flex justify-between text-gray-300">
            <div>
              <label className="block">Số ss:</label>
              <input
                type="text"
                value={receipt.exportReceiptID}
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
            <div>
              <label className="block">Đại lý:</label>
              <input
                type="text"
                value={receipt.agentName || 'N/A'}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="flex-1 items-center">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800 text-gray-300">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-5">Mục</th>
                <th className="py-3 px-4">Đơn vị tính</th>
                <th className="py-3 px-4">Số lượng</th>
                <th className="py-3 px-4">Giá xuất</th>
                <th className="py-3 px-4">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipt.details.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-5 py-3">{item.productName}</td>
                  <td className="px-4 py-3">{item.unitName}</td>
                  <td className="px-4 py-3">{item.quantityExport}</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(item.exportPrice)} đ</td>
                  <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(item.intoMoney)} đ</td>
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
                value={new Intl.NumberFormat('vi-VN').format(totalMoney) + ' đ'}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
            <div>
              <label className="block">Số tiền trả:</label>
              <input
                type="text"
                value={new Intl.NumberFormat('vi-VN').format(receipt.paymentAmount || 0) + ' đ'}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
            <div>
              <label className="block">Số tiền nợ:</label>
              <input
                type="text"
                value={new Intl.NumberFormat('vi-VN').format(receipt.remainAmount || 0) + ' đ'}
                readOnly
                className="bg-gray-800 text-white ml-2 w-32 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="button bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            className="button bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className="button bg-blue-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Xuất khẩu PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReceiptDetails;