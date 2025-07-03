import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class DebtLimitErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error for debugging
        console.error('DebtLimitErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI for debt limit errors
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FiAlertTriangle className="text-red-500 flex-shrink-0" />
                        <div>
                            <h4 className="text-red-800 font-medium">Lỗi hiển thị thông tin nợ</h4>
                            <p className="text-red-600 text-sm mt-1">
                                Không thể hiển thị thông tin giới hạn nợ. Vui lòng thử lại sau.
                            </p>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default DebtLimitErrorBoundary; 