import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { TEST_USERS } from '../../../constants/api.js';
import { getRedirectRoute } from '../../../utils/roleRoutes.js';

const Login = () => {
  const [credentials, setCredentials] = useState({
    personEmail: '',
    passwordHash: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Chuyển hướng dựa trên role sau khi đăng nhập thành công
  if (isAuthenticated && user) {
    const intendedRoute = location.state?.from?.pathname || '/';
    const redirectRoute = getRedirectRoute(user, intendedRoute);
    return <Navigate to={redirectRoute} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(credentials.personEmail, credentials.passwordHash);

    if (!result.success) {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const fillDemoCredentials = (role) => {
    const demoCredentials = {
      ADMIN: { personEmail: TEST_USERS.ADMIN.email, passwordHash: TEST_USERS.ADMIN.password },
      WAREHOUSE: { personEmail: TEST_USERS.WAREHOUSE.email, passwordHash: TEST_USERS.WAREHOUSE.password },
      DEBT: { personEmail: TEST_USERS.DEBT.email, passwordHash: TEST_USERS.DEBT.password },
      VIEWER: { personEmail: TEST_USERS.VIEWER.email, passwordHash: TEST_USERS.VIEWER.password }
    };

    setCredentials(demoCredentials[role]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center transform transition-all duration-1000 ease-out animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <FaShieldAlt className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Chào mừng trở lại
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Hệ thống quản lý đại lý
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="personEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                  focusedField === 'personEmail' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <FaUser className="h-5 w-5" />
                </div>
                <input
                  id="personEmail"
                  name="personEmail"
                  type="email"
                  required
                  value={credentials.personEmail}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('personEmail')}
                  onBlur={() => setFocusedField('')}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="passwordHash" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                  focusedField === 'passwordHash' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  id="passwordHash"
                  name="passwordHash"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.passwordHash}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('passwordHash')}
                  onBlur={() => setFocusedField('')}
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo Accounts */}
          
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Đăng nhập để truy cập hệ thống quản lý</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
