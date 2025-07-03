package org.example.AgentManagementBE.DTO.request;

public class ApiResponse<T> {
    private int code;
    private String status;
    private String message;
    private T data;

    public ApiResponse() {}

    public ApiResponse(int code, String status, String message, T data) {
        this.code = code;
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // Static method tiện dụng cho phản hồi thành công
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(200, "success", message, data);
    }
    public static <T> ApiResponse<T> created(String message, T data) {
        return new ApiResponse<>(201, "success", message, data);
    }
    // Static method tiện dụng cho phản hồi lỗi
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, "error", message, null);
    }

    // Getter & Setter
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
