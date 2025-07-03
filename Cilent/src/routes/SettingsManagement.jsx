import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCogs, FaUsers, FaBoxes, FaMoneyBillWave } from 'react-icons/fa';
import SettingsLayout from '../layouts/components/settings/SettingsLayout';

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('agent-types');

  const tabs = [
    { 
      id: 'agent-types', 
      label: 'QUY ĐỊNH HIỆN HÀNH', 
      icon: <FaUsers className="text-xl" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverBg: 'hover:bg-blue-500/20',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-6 bg-gray-900 min-h-screen text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
            <FaCogs className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Cài Đặt Hệ Thống
            </h1>
            <p className="text-gray-400 mt-1">
              Quản lý các tham số của hệ thống quản lý đại lý
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? `${tab.bgColor} border-current ${tab.color} shadow-lg scale-105`
                  : `bg-gray-800 border-gray-700 text-gray-400 ${tab.hoverBg} hover:border-gray-600`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-lg ${activeTab === tab.id ? 'bg-white/10' : 'bg-gray-700'}`}>
                  {tab.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{tab.label}</h3>
                  <p className="text-sm opacity-80">{tab.description}</p>
                </div>
              </div>
              
              {/* Active Indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={itemVariants}>
        <SettingsLayout activeTab={activeTab} />
      </motion.div>

      {/* Footer Info */}
      <motion.div 
        className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              💡 <strong>Lưu ý:</strong> Cần reload lại trang để áp dụng quy định mới cho hệ thống.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Phiên bản: v1.0.0 | Cập nhật: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsManagement; 