-- XÓA CÁC BẢNG NẾU ĐÃ TỒN TẠI (đảm bảo thứ tự tránh lỗi khóa ngoại)
DROP TABLE IF EXISTS 
    ImportDetail,
    ImportReceipt,
    ExportDetail,
    ExportReceipt,
    PaymentReceipt,
    SalesReportDetail,
    SalesReport,
    DebtReport,
    Product,
    Unit,
    Agent,
    AgentType,
    District,
    Person,
    Person_Role,
    Role,
    Parameter;

-- QUẬN (District)
CREATE TABLE District (
    district_id INT AUTO_INCREMENT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL UNIQUE
);

-- LOẠI ĐẠI LÝ (AgentType)
CREATE TABLE Agent_Type (
    agent_type_id INT AUTO_INCREMENT PRIMARY KEY,
    agent_type_name VARCHAR(100) NOT NULL UNIQUE,
    max_debt INT NOT NULL
);

-- BẢNG CẤU HÌNH HỆ THỐNG (Parameter)
CREATE TABLE Parameter (
    param_key VARCHAR(100) PRIMARY KEY,
    param_value TEXT NOT NULL,
    param_description TEXT
);

-- ĐƠN VỊ TÍNH (Unit)
CREATE TABLE Unit (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL UNIQUE
);

-- ĐẠI LÝ (Agent)
CREATE TABLE Agent (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    agent_type_id INT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    district INT NOT NULL,
    reception_date DATE NOT NULL,
    debt_money INT NOT NULL,
    FOREIGN KEY (agent_type_id) REFERENCES Agent_Type(agent_type_id),
    FOREIGN KEY (district) REFERENCES District(district_id)
);

-- TÀI KHOẢN NGƯỜI DÙNG (Person)
CREATE TABLE Person (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    person_name VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    person_email VARCHAR(100),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    agent_id INT,
    FOREIGN KEY (agent_id) REFERENCES Agent(agent_id)
);

-- VAI TRÒ HỆ THỐNG (Role)
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- PHÂN QUYỀN NHIỀU-NHIỀU GIỮA NGƯỜI DÙNG VÀ VAI TRÒ (Person_Role)
CREATE TABLE Person_Role (
    person_id INT,
    role_id INT,
    PRIMARY KEY (person_id, role_id),
    FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role(role_id) ON DELETE CASCADE
);

-- MẶT HÀNG (Product)
CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    unit INT NOT NULL,
    import_price INT NOT NULL,
    export_price INT NOT NULL,
    inventory_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (unit) REFERENCES Unit(unit_id)
);

-- PHIẾU NHẬP HÀNG (ImportReceipt)
CREATE TABLE Import_Receipt (
    import_receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    create_date DATE NOT NULL,
    total_amount INT NOT NULL
);

-- CHI TIẾT PHIẾU NHẬP (ImportDetail)
CREATE TABLE Import_Detail (
    import_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    import_receipt_id INT NOT NULL,
    product INT NOT NULL,
    quantity_import INT NOT NULL,
    import_price INT NOT NULL,
    into_money INT NOT NULL,
    FOREIGN KEY (import_receipt_id) REFERENCES Import_Receipt(import_receipt_id) ON DELETE CASCADE,
    FOREIGN KEY (product) REFERENCES Product(product_id)
);

-- PHIẾU XUẤT HÀNG (ExportReceipt)
CREATE TABLE Export_Receipt (
    export_receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    agent INT NOT NULL,
    create_date DATE NOT NULL,
    total_amount INT NOT NULL,
    paid_amount INT NOT NULL,
    remaining_amount INT NOT NULL,
    FOREIGN KEY (agent) REFERENCES Agent(agent_id)
);

-- CHI TIẾT PHIẾU XUẤT (ExportDetail)
CREATE TABLE Export_Detail (
    export_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    export_receipt_id INT NOT NULL,
    product INT NOT NULL,
    quantity_export INT NOT NULL,
    export_price INT NOT NULL,
    into_money INT NOT NULL,
    FOREIGN KEY (export_receipt_id) REFERENCES Export_Receipt(export_receipt_id) ON DELETE CASCADE,
    FOREIGN KEY (product) REFERENCES Product(product_id)
);

-- PHIẾU THU TIỀN (PaymentReceipt)
CREATE TABLE Payment_Receipt (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    agent INT NOT NULL,
    payment_date DATE NOT NULL,
    revenue INT NOT NULL CHECK (revenue >= 0),
    FOREIGN KEY (agent) REFERENCES Agent(agent_id)
);

-- BÁO CÁO DOANH SỐ (SalesReport)
CREATE TABLE Sales_Report (
    sales_report_id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    total_revenue INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHI TIẾT BÁO CÁO DOANH SỐ (SalesReportDetail)
CREATE TABLE Sales_Report_Detail (
    sales_report_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    sales_report_id INT NOT NULL,
    agent INT NOT NULL,
    export_count INT,
    total_amount INT NOT NULL,
    paid_amount INT NOT NULL,
    ratio INT,
    FOREIGN KEY (sales_report_id) REFERENCES Sales_Report(sales_report_id) ON DELETE CASCADE,
    FOREIGN KEY (agent) REFERENCES Agent(agent_id)
);

-- BÁO CÁO CÔNG NỢ (DebtReport)
CREATE TABLE Debt_Report (
    debt_report_id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    agent INT NOT NULL,
    first_debt INT NOT NULL,
    arisen_debt INT NOT NULL,
    last_debt INT NOT NULL,
    FOREIGN KEY (agent) REFERENCES Agent(agent_id)
);

-- THÊM VAI TRÒ MẶC ĐỊNH
INSERT INTO Role(role_name) VALUES 
('ADMIN'),
('WAREHOUSE_ACCOUNTANT'),
('DEBT_ACCOUNTANT'),
('VIEWER');

-- THÊM NGƯỜI DÙNG MẪU
INSERT INTO Person(person_name, password_hash, person_email, full_name)
VALUES 
('admin', SHA2('123456', 256), 'vosithongtri@gmail.com', 'Người Quản Trị'),
('ketoankho', SHA2('123456', 256), 'phamtranquoc@gmail.com', 'Kế toán Kho'),
('ketoanno', SHA2('123456', 256), 'nguyenminhduc@gmail.com', 'Kế toán Nợ'),
('viewer1', SHA2('123456', 256), 'hongocquynh@gmail.com', 'Người xem');

-- GÁN VAI TRÒ CHO NGƯỜI DÙNG
INSERT INTO Person_Role(person_id, role_id)
SELECT p.person_id, r.role_id
FROM Person p, Role r
WHERE 
    (p.person_name = 'admin' AND r.role_name = 'ADMIN') OR
    (p.person_name = 'ketoankho' AND r.role_name = 'WAREHOUSE_ACCOUNTANT') OR
    (p.person_name = 'ketoanno' AND r.role_name = 'DEBT_ACCOUNTANT') OR
    (p.person_name = 'viewer1' AND r.role_name = 'VIEWER');

-- DỮ LIỆU MẪU CHO DISTRICT (20 QUẬN)
INSERT INTO District(district_name) VALUES
('Quận 1'), ('Quận 2'), ('Quận 3'), ('Quận 4'), ('Quận 5'),
('Quận 6'), ('Quận 7'), ('Quận 8'), ('Quận 9'), ('Quận 10'),
('Quận 11'), ('Quận 12'), ('Bình Thạnh'), ('Tân Bình'), ('Phú Nhuận'),
('Gò Vấp'), ('Thủ Đức'), ('Bình Tân'), ('Tân Phú'), ('Hóc Môn');

-- DỮ LIỆU MẪU CHO LOẠI ĐẠI LÝ
INSERT INTO Agent_Type(agent_type_name, max_debt) VALUES
('Loại 1', 10000000),
('Loại 2', 5000000);

-- DỮ LIỆU MẪU CHO ĐƠN VỊ TÍNH
INSERT INTO Unit(unit_name) VALUES
('Thùng'), ('Chai'), ('Lốc');

-- DỮ LIỆU MẪU CHO MẶT HÀNG
INSERT INTO Product(product_name, unit, import_price, export_price) VALUES
('Nước suối Lavie', 2, 3000, 3060),
('Sữa TH True Milk', 2, 7000, 7140),
('Bia Tiger', 1, 330000, 336600),
('Mì Hảo Hảo', 3, 5500, 5610),
('Trà xanh C2', 2, 5000, 5100);

-- THÔNG SỐ HỆ THỐNG MẪU
INSERT INTO Parameter(param_key, param_value, param_description) VALUES
('export_price_ratio', '1.02', 'Tỷ lệ đơn giá xuất'),
('max_agent_per_district', '4', 'Số đại lý tối đa trong 1 quận'),
('apply_rule_check_collected_amount', '1/0', 'Áp dụng qui định kiểm tra số tiền thu');




