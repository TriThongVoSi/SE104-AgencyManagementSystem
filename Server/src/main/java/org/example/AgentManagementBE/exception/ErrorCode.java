package org.example.AgentManagementBE.exception;

public enum ErrorCode {

    // ====== USER / PERSON ======
    USER_NOT_FOUND(404, "Không tìm thấy người dùng!"),
    EMAIL_ALREADY_EXISTS(400, "Email đã tồn tại!"),
    USERNAME_ALREADY_EXISTS(400, "Tên đăng nhập đã tồn tại!"),
    INVALID_PASSWORD(401, "Mật khẩu không đúng!"),
    INVALID_EMAIL_FORMAT(400, "Email không đúng định dạng!"),
    USER_INACTIVE(401, "Tài khoản đã bị vô hiệu hóa!"),
    UNAUTHORIZED(401, "Không được phép truy cập!"),

    // ====== UNIT ======
    UNIT_NOT_FOUND(404, "Không tìm thấy đơn vị!"),
    UNIT_ALREADY_EXISTS(400, "Đơn vị đã tồn tại!"),
    UNIT_IN_USE(400, "Không thể xóa đơn vị vì đang được sử dụng trong sản phẩm!"),

    // ====== PARAMETER ======
    PARAMETER_NOT_FOUND(404, "Không tìm thấy tham số!"),
    PARAMETER_ALREADY_EXISTS(400, "Tham số đã tồn tại!"),
    INVALID_PARAMETER_VALUE(400, "Giá trị tham số không hợp lệ!"),

    // ====== DISTRICT ======
    DISTRICT_NOT_FOUND(404, "Không tìm thấy quận!"),
    DISTRICT_ALREADY_EXISTS(400, "Quận đã tồn tại!"),
    DISTRICT_HAS_AGENTS(400, "Không thể xóa quận vì đang có đại lý!"),

    // ====== AGENT TYPE ======
    AGENT_TYPE_NOT_FOUND(404, "Không tìm thấy loại đại lý!"),
    AGENT_TYPE_ALREADY_EXISTS(400, "Loại đại lý đã tồn tại!"),
    AGENT_TYPE_IN_USE(400, "Không thể xóa loại đại lý vì đang có đại lý sử dụng!"),
    AGENT_DEBT_EXCEEDS_LIMIT(400, "Số tiền nợ vượt quá giới hạn tối đa cho phép của loại đại lý!"),

    // ====== AGENT ======
    AGENT_NOT_FOUND(404, "Không tìm thấy đại lý!"),
    AGENT_ALREADY_EXISTS(400, "Đại lý đã tồn tại!"),
    AGENT_CODE_DUPLICATE(400, "Mã đại lý đã tồn tại!"),
    AGENT_DISTRICT_NOT_FOUND(404, "Không tìm thấy quận"),
    AGENT_MAX_LIMIT_REACHED(400, "Số lượng đại lý trong quận đã đạt tối đa"),
    AGENT_HAS_DEBT(400, "Không thể xóa đại lý vì còn nợ tiền"),
    AGENT_DEBT_LIMIT_EXCEEDED(400, "Số tiền nợ vượt quá giới hạn cho phép!"),
    AGENT_HAS_EXPORT_RECEIPTS(400, "Không thể xóa đại lý vì còn tồn tại phiếu xuất hàng!"),

    // ====== PRODUCT ======
    PRODUCT_NOT_FOUND(404, "Không tìm thấy mặt hàng!"),
    PRODUCT_ALREADY_EXISTS(400, "Mặt hàng đã tồn tại!"),
    INSUFFICIENT_INVENTORY(400, "Số lượng tồn kho không đủ!"),
    PRODUCT_INSUFFICIENT_QUANTITY(400, "Số lượng sản phẩm không đủ"),

    // ====== INVOICE - RECEIPT ======
    RECEIPT_NOT_FOUND(404, "Không tìm thấy phiếu thu!"),
    RECEIPT_ALREADY_EXISTS(400, "Phiếu thu đã tồn tại!"),

    // ====== IMPORT / EXPORT FORM ======
    IMPORT_FORM_NOT_FOUND(404, "Không tìm thấy phiếu nhập hàng!"),
    EXPORT_FORM_NOT_FOUND(404, "Không tìm thấy phiếu xuất hàng!"),
    FORM_ALREADY_EXISTS(400, "Phiếu đã tồn tại!"),
    FORM_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết phiếu!"),
    INVALID_FORM_DATE(400, "Ngày phiếu không hợp lệ!"),
    INVALID_FORM_AMOUNT(400, "Số tiền phiếu không hợp lệ!"),
    FORM_IN_USE(400, "Không thể xóa mặt hàng vì đang được sử dụng trong phiếu!"),

    // ====== EXPORT RECEIPT ======
    EXPORT_RECEIPT_NOT_FOUND(404, "Không tìm thấy phiếu xuất hàng!"),
    EXPORT_RECEIPT_ALREADY_EXISTS(400, "Phiếu xuất hàng đã tồn tại!"),
    EXPORT_RECEIPT_INVALID_DATE(400, "Ngày xuất hàng không hợp lệ!"),
    EXPORT_RECEIPT_INVALID_AMOUNT(400, "Số tiền phiếu xuất không hợp lệ!"),
    EXPORT_RECEIPT_AGENT_NOT_FOUND(404, "Không tìm thấy đại lý trong phiếu xuất!"),
    EXPORT_RECEIPT_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết phiếu xuất!"),
    EXPORT_RECEIPT_INSUFFICIENT_PAYMENT(400, "Số tiền thanh toán không đủ!"),
    EXPORT_RECEIPT_INVALID_TOTAL_MONEY(400, "Tổng tiền phiếu xuất không hợp lệ!"),
    EXPORT_RECEIPT_INVALID_QUANTITY(400, "Số lượng xuất không hợp lệ!"),
    EXPORT_RECEIPT_INVALID_MONTH(400, "Tháng xuất hàng không hợp lệ!"),
    EXPORT_RECEIPT_INVALID_YEAR(400, "Năm xuất hàng không hợp lệ!"),

    // ====== IMPORT RECEIPT ======
    IMPORT_RECEIPT_NOT_FOUND(404, "Không tìm thấy phiếu nhập hàng!"),
    IMPORT_RECEIPT_ALREADY_EXISTS(400, "Phiếu nhập hàng đã tồn tại!"),
    IMPORT_RECEIPT_INVALID_DATE(400, "Ngày nhập hàng không hợp lệ!"),
    IMPORT_RECEIPT_INVALID_AMOUNT(400, "Số tiền phiếu nhập không hợp lệ!"),
    IMPORT_RECEIPT_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết phiếu nhập!"),
    IMPORT_RECEIPT_PRODUCT_NOT_FOUND(404, "Không tìm thấy sản phẩm trong phiếu nhập!"),
    IMPORT_RECEIPT_INVALID_QUANTITY(400, "Số lượng nhập không hợp lệ!"),
    IMPORT_RECEIPT_INVALID_PRICE(400, "Giá nhập không hợp lệ!"),
    IMPORT_RECEIPT_INVALID_TOTAL_PRICE(400, "Tổng tiền phiếu nhập không hợp lệ!"),
    IMPORT_RECEIPT_INVALID_MONTH(400, "Tháng nhập hàng không hợp lệ!"),
    IMPORT_RECEIPT_INVALID_YEAR(400, "Năm nhập hàng không hợp lệ!"),

    // ====== IMPORT DETAIL ======
    IMPORT_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết nhập hàng!"),
    IMPORT_DETAIL_ALREADY_EXISTS(400, "Chi tiết nhập hàng đã tồn tại!"),
    INVALID_IMPORT_QUANTITY(400, "Số lượng nhập không hợp lệ!"),
    INVALID_IMPORT_PRICE(400, "Giá nhập không hợp lệ!"),

    // ====== REPORT ======
    DEBT_REPORT_NOT_FOUND(404, "Không tìm thấy báo cáo công nợ!"),
    SALES_REPORT_NOT_FOUND(404, "Không tìm thấy báo cáo doanh số!"),
    DEBT_REPORT_ALREADY_EXISTS(400, "Báo cáo công nợ đã tồn tại!"),
    SALES_REPORT_ALREADY_EXISTS(400, "Báo cáo doanh số đã tồn tại!"),
    SALES_REPORT_INVALID_MONTH(400, "Tháng báo cáo doanh số không hợp lệ!"),
    SALES_REPORT_INVALID_YEAR(400, "Năm báo cáo doanh số không hợp lệ!"),
    SALES_REPORT_INVALID_ID(400, "ID báo cáo doanh số không hợp lệ!"),
    SALES_REPORT_LIST_EMPTY(404, "Không có báo cáo doanh số nào!"),

    // ====== SALES REPORT DETAIL ======
    SALES_REPORT_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết báo cáo doanh số!"),
    SALES_REPORT_DETAIL_ALREADY_EXISTS(400, "Chi tiết báo cáo doanh số đã tồn tại!"),
    SALES_REPORT_DETAIL_CREATION_FAILED(400, "Tạo chi tiết báo cáo doanh số thất bại!"),
    SALES_REPORT_DETAIL_INVALID_MONTH(400, "Tháng báo cáo doanh số không hợp lệ!"),
    SALES_REPORT_DETAIL_INVALID_YEAR(400, "Năm báo cáo doanh số không hợp lệ!"),
    SALES_REPORT_DETAIL_INVALID_AGENT(400, "Đại lý không hợp lệ!"),
    SALES_REPORT_DETAIL_INVALID_QUANTITY(400, "Số lượng xuất không hợp lệ!"),
    SALES_REPORT_DETAIL_INVALID_VALUE(400, "Giá trị không hợp lệ!"),
    SALES_REPORT_DETAIL_INVALID_RATIO(400, "Tỷ lệ không hợp lệ!"),

    // ====== VALIDATION / FORMAT / LOGIC ======
    BAD_REQUEST(400, "Yêu cầu không hợp lệ!"),
    MISSING_REQUIRED_FIELD(400, "Thiếu trường bắt buộc!"),
    INVALID_FORMAT(400, "Dữ liệu không đúng định dạng!"),
    DATA_INTEGRITY_VIOLATION(409, "Xung đột dữ liệu!"),
    INVALID_DATE_RANGE(400, "Khoảng thời gian không hợp lệ!"),
    NUMBER_NEGATIVE(400, "Giá trị số không được âm!"),

    // ====== SYSTEM / SERVER ======
    INTERNAL_SERVER_ERROR(500, "Lỗi máy chủ nội bộ!"),
    SERVICE_UNAVAILABLE(503, "Dịch vụ tạm thời không khả dụng!"),
    UNKNOWN_ERROR(520, "Lỗi không xác định!"),
    NOT_FOUND(404, "Không tìm thấy tài nguyên!"),

    // Payment errors
    PAYMENT_RECEIPT_NOT_FOUND(404, "Không tìm thấy phiếu thu tiền"),
    PAYMENT_AMOUNT_EXCEEDS_DEBT(400, "Số tiền thu vượt quá số tiền nợ"),

    // Export errors
    EXPORT_DETAIL_NOT_FOUND(404, "Không tìm thấy chi tiết xuất hàng"),
    EXPORT_DETAIL_ALREADY_EXISTS(400, "Chi tiết xuất hàng đã tồn tại"),
    INVALID_EXPORT_QUANTITY(400, "Số lượng xuất không hợp lệ"),
    INVALID_EXPORT_PRICE(400, "Giá xuất không hợp lệ"),
    INSUFFICIENT_PAYMENT(400, "Số tiền thanh toán không đủ"),

    // Invalid date format
    INVALID_DATE_FORMAT(400, "Định dạng ngày tháng không hợp lệ"),

    // ====== PRICE VALIDATION ======
    INVALID_PRICE(400, "Giá không hợp lệ!"),
    INVALID_PRICE_NEGATIVE(400, "Giá không được âm!"),
    INVALID_PRICE_ZERO(400, "Giá không được bằng 0!"),
    INVALID_PRICE_FORMAT(400, "Định dạng giá không hợp lệ!"),
    INVALID_PRICE_RANGE(400, "Giá nằm ngoài khoảng cho phép!"),
    INVALID_PRICE_DECIMAL(400, "Số thập phân của giá không hợp lệ!"),
    INVALID_PRICE_CURRENCY(400, "Đơn vị tiền tệ không hợp lệ!"),
    INVALID_PRICE_COMPARISON(400, "So sánh giá không hợp lệ!"),
    INVALID_PRICE_CALCULATION(400, "Tính toán giá không hợp lệ!"),

    // ====== ROLE ======
    ROLE_NOT_FOUND(404, "Không tìm thấy vai trò!"),
    ROLE_ALREADY_EXISTS(400, "Vai trò đã tồn tại!"),
    ROLE_ALREADY_ASSIGNED(400, "Vai trò đã được gán cho người dùng!"),
    ROLE_NOT_ASSIGNED(404, "Vai trò chưa được gán cho người dùng!");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
