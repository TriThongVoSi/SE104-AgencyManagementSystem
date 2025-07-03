package org.example.AgentManagementBE.exception;

public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    // Constructor có ErrorCode và message tùy chỉnh
    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    // Constructor chỉ với ErrorCode, dùng message mặc định
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public int getCode() {
        return errorCode.getCode();
    }

    @Override
    public String getMessage() {
        return super.getMessage();
    }
}
