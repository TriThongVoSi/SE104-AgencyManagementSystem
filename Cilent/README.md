# Hệ Thống Quản Lý Đại Lý (Agency Management System)

## Giới thiệu
Hệ thống Quản Lý Đại Lý là một ứng dụng web giúp doanh nghiệp quản lý toàn diện các đại lý, sản phẩm, phiếu nhập/xuất, công nợ, thu tiền, báo cáo doanh số và các quy định hệ thống. Ứng dụng được xây dựng với ReactJS (frontend) và **Java Spring Boot** (backend), giao diện hiện đại, dễ sử dụng, hỗ trợ phân quyền người dùng.

## Tính năng nổi bật
- **Quản lý đại lý:** Thêm, sửa, xóa, tìm kiếm, xem chi tiết đại lý.
- **Quản lý sản phẩm:** Quản lý danh mục sản phẩm, đơn vị tính, nhập/xuất kho.
- **Quản lý phiếu nhập/xuất:** Tạo, chỉnh sửa, xem chi tiết, thống kê phiếu nhập và phiếu xuất hàng hóa.
- **Quản lý phiếu thu tiền:** Tạo phiếu thu, xem lịch sử thu tiền từ đại lý, thống kê doanh thu.
- **Quản lý công nợ:** Theo dõi, tổng hợp, báo cáo công nợ đại lý theo tháng/năm.
- **Báo cáo doanh số:** Thống kê doanh số, xuất báo cáo Excel, biểu đồ trực quan.
- **Quản lý người dùng:** Thêm, sửa, xóa, phân quyền người dùng (Admin, Kế toán kho, Kế toán công nợ, Xem báo cáo).
- **Cài đặt hệ thống:** Quản lý các quy định, tham số hệ thống (giới hạn nợ, số lượng đại lý/quận, ...).
- **Phân quyền truy cập:** Bảo vệ các route theo vai trò người dùng.

## Công nghệ sử dụng
- **Frontend:** ReactJS, Vite, TailwindCSS, MUI, React Router, Recharts, React Toastify
- **Backend:** Java Spring Boot (RESTful API)
- **Khác:** XLSX (xuất Excel), jsPDF (xuất PDF), ESLint, PostCSS

## Hướng dẫn cài đặt & chạy dự án
### 1. Yêu cầu môi trường
- Node.js >= 16.x
- npm >= 8.x
- Java 17+ (hoặc phù hợp với backend Spring Boot)
- Maven hoặc Gradle

### 2. Cài đặt frontend
```bash
npm install
```

### 3. Chạy ứng dụng (phát triển)
**Chạy backend Spring Boot:**
- Mở project backend bằng IDE (IntelliJ, Eclipse, VS Code, ...), hoặc dùng terminal.
- Build và chạy backend:
  ```bash
  ./mvnw spring-boot:run
  ```
  hoặc
  ```bash
  ./gradlew bootRun
  ```
  hoặc chạy trực tiếp file jar (sau khi build):
  ```bash
  java -jar target/ten-file-backend.jar
  ```
- Mặc định backend chạy tại: http://localhost:8080
### 4. Kết nối với database MySQL Workbench
Chạy script file agentmanagementdb.sql để tạo cơ sở dữ liệu
Setup: src/main/resources
file application.properties 
Điền thông tin đầy đủ 3 dòng code này
spring.datasource.url=jdbc:mysql://localhost:3306/[DatabaseName]?useSSL=true
spring.datasource.username=[YourUserName]
spring.datasource.password=[YourPassWord]
**Chạy frontend React:**
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```bash
npm run dev
```
- Frontend: http://localhost:5173

### 5. Tài khoản demo
Bạn có thể đăng nhập bằng các tài khoản mẫu sau:
- **Admin:** vosithongtri@gmail.com / 123456
- **Kế toán kho:** phamtranquoc@gmail.com / 123456
- **Kế toán công nợ:** nguyenminhduc@gmail.com / 123456
- **Xem báo cáo:** hongocquynh@gmail.com / 123456