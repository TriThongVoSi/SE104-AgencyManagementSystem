package org.example.AgentManagementBE.exception;

import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        ErrorCode code = ex.getErrorCode();
        return ResponseEntity.status(code.getCode())
                .body(new ApiResponse<>(code.getCode(), "error", code.getMessage(), null));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(415)
                .body(new ApiResponse<>(415, "error", 
                    "Content-Type không được hỗ trợ. Vui lòng sử dụng 'application/json'", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldError() != null 
            ? ex.getBindingResult().getFieldError().getDefaultMessage()
            : "Dữ liệu không hợp lệ";
        return ResponseEntity.status(400)
                .body(new ApiResponse<>(400, "error", message, null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ApiResponse<>(500, "error", "Lỗi hệ thống: " + ex.getMessage(), null));
    }
}
