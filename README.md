# Hệ Thống Quản Lý Đại Lý (Agency Management System)

## Giới thiệu
Hệ thống Quản Lý Đại Lý là một ứng dụng web giúp doanh nghiệp quản lý toàn diện các đại lý, sản phẩm, phiếu nhập/xuất, công nợ, thu tiền, báo cáo doanh số và các quy định hệ thống. Ứng dụng gồm hai phần:
- **Frontend:** ReactJS (Vite, TailwindCSS, MUI)
- **Backend:** Java Spring Boot (RESTful API)
- **Database:** MySQL

## Tính năng nổi bật
- Quản lý đại lý, sản phẩm, đơn vị tính, phiếu nhập/xuất, phiếu thu tiền
- Quản lý công nợ, báo cáo doanh số, xuất báo cáo Excel/PDF
- Quản lý người dùng, phân quyền truy cập
- Cài đặt hệ thống, tham số, giới hạn nợ, số lượng đại lý/quận
- Giao diện hiện đại, trực quan, bảo vệ route theo vai trò

## Cấu trúc dự án
```
AgencyManagementSystem/
├── Cilent/      # Frontend ReactJS (Vite)
├── Server/      # Backend Spring Boot
├── Database/    # File SQL khởi tạo CSDL
```

## Công nghệ sử dụng
- **Frontend:** ReactJS, Vite, TailwindCSS, MUI, React Router, Recharts, React Toastify
- **Backend:** Java 17+, Spring Boot 3.x, Spring Security, JWT, JPA, Maven
- **Database:** MySQL
- **Khác:** XLSX, jsPDF, ESLint, PostCSS

## Hướng dẫn cài đặt & chạy hệ thống
### 1. Yêu cầu môi trường
- Node.js >= 16.x, npm >= 8.x
- Java 17+ (hoặc phù hợp với backend Spring Boot)
- Maven (hoặc Gradle)
- MySQL Server

### 2. Cài đặt database
- Mở MySQL Workbench hoặc terminal, chạy script `Database/agentmanagementdb.sql` để tạo các bảng và dữ liệu mẫu.

### 3. Cấu hình backend
- Mở file `Server/src/main/resources/application.properties` và chỉnh sửa:
```
spring.datasource.url=jdbc:mysql://localhost:3306/[DatabaseName]?useSSL=true
spring.datasource.username=[YourUserName]
spring.datasource.password=[YourPassWord]
```
- Đảm bảo MySQL đã chạy và đúng thông tin kết nối.

### 4. Chạy backend (Spring Boot)
- Di chuyển vào thư mục `Server/`:
```bash
cd Server
./mvnw spring-boot:run
```
- Hoặc build và chạy file jar:
```bash
./mvnw clean package
java -jar target/AgentManagementBE-0.0.1-SNAPSHOT.jar
```
- Mặc định backend chạy tại: http://localhost:8080

### 5. Cài đặt & chạy frontend (ReactJS)
- Di chuyển vào thư mục `Cilent/`:
```bash
cd Cilent
npm install
```
- Chạy frontend:
```bash
npm run dev
```
- Ứng dụng frontend mặc định tại: http://localhost:5173

### 6. Tài khoản demo
Bạn có thể đăng nhập bằng các tài khoản mẫu sau:
- **Admin:** vosithongtri@gmail.com / 123456
- **Kế toán kho:** phamtranquoc@gmail.com / 123456
- **Kế toán công nợ:** nguyenminhduc@gmail.com / 123456
- **Xem báo cáo:** hongocquynh@gmail.com / 123456

## Ghi chú
- Đảm bảo backend chạy trước khi truy cập frontend.
- Có thể chỉnh sửa port backend/frontend trong cấu hình nếu cần.
- Để phát triển, có thể dùng lệnh `npm run start` ở frontend để chạy đồng thời server mock và client.
- Xem thêm hướng dẫn chi tiết trong từng thư mục `Cilent/README.md` (frontend).

---
**© 7/2025 Agency Management System** 
---
Tác giả: [Hồ Ngọc Quỳnh - Nguyễn Minh Đức - Phạm Trấn Quốc - Võ Sĩ Trí Thông] 
---
Nhận file .docx báo cáo đồ án này qua gmail vosithongtri@gmail.com (hạt dẻ 150 cành cả nhóm)
