const BASE_URL = 'http://localhost:8080';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getAllAgents = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy danh sách đại lý: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: (result.data || []).map(agent => ({
      agentId: agent.agentId || agent.agentID || agent.id,
      agentName: agent.agentName,
      agentType: agent.agentType || agent.agentTypeID,
      phone: agent.phone,
      email: agent.email,
      address: agent.address,
      district: agent.district || agent.districtID,
      receptionDate: agent.receptionDate,
      debtMoney: agent.debtMoney,
    })), message: result.message };
  } catch (err) {
    console.error('Lỗi getAllAgents:', err.message);
    throw err;
  }
};

export const getAgentById = async (agentId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy thông tin đại lý: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi getAgentById:', err.message);
    throw err;
  }
};

export const addAgent = async (agentData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(agentData),
    });
    
    const result = await response.json();
    
    // Trả về kết quả bao gồm cả lỗi để component có thể xử lý
    return { 
      status: result.status, 
      data: result.data, 
      message: result.message,
      code: result.code,
      success: response.ok && (result.code === 200 || result.code === 201)
    };
  } catch (err) {
    console.error('Lỗi addAgent:', err.message);
    return {
      status: 'error',
      data: null,
      message: 'Không thể kết nối đến server',
      code: 500,
      success: false
    };
  }
};

export const updateAgent = async (agentId, agentData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/updateAgent/${agentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(agentData),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật đại lý: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateAgent:', err.message);
    throw err;
  }
};

export const deleteAgent = async (agentId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể xóa đại lý: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi deleteAgent:', err.message);
    throw err;
  }
};

export const updateAgentDebt = async (agent) => {
  try {
    const response = await fetch(`${BASE_URL}/api/agents/${agentId}/debt`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(agent),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật công nợ: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data, message: result.message };
  } catch (err) {
    console.error('Lỗi updateAgentDebt:', err.message);
    throw err;
  }
};

export const updateAgentTypeMaxDebt = async (agentTypeID, maximumDebt) => {
  try {
    const response = await fetch(`${BASE_URL}/agent-type/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ agentTypeID, maximumDebt }),
    });
    if (!response.ok) throw new Error(`Không thể cập nhật nợ tối đa: ${response.status}`);
    const result = await response.json();
    return { status: result.status, message: result.message };
  } catch (err) {
    console.error('Lỗi updateAgentTypeMaxDebt:', err.message);
    throw err;
  }
};

export const getAgentTransactions = async (agentId) => {
  try {
    const response = await fetch(`${BASE_URL}/agent/transactions/${agentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Không thể lấy lịch sử giao dịch: ${response.status}`);
    const result = await response.json();
    return { status: result.status, data: result.data || [], message: result.message };
  } catch (err) {
    console.error('Lỗi getAgentTransactions:', err.message);
    throw err;
  }
};

/**
 * Agent Service Class để tương thích với PaymentReceiptService
 */
class AgentService {
  
  /**
   * Lấy danh sách tất cả đại lý
   * @returns {Promise<Object>} Response với success, data, message
   */
  async getAllAgents() {
    try {
      const result = await getAllAgents();
      return {
        success: result.status === 'success',
        data: result.data || [],
        message: result.message || 'Lấy danh sách đại lý thành công'
      };
    } catch (error) {
      console.error('Error in AgentService.getAllAgents:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách đại lý',
        data: []
      };
    }
  }

  /**
   * Lấy thông tin đại lý theo ID
   * @param {number} agentId - ID đại lý
   * @returns {Promise<Object>} Response với success, data, message
   */
  async getAgentById(agentId) {
    try {
      const result = await getAgentById(agentId);
      return {
        success: result.status === 'success',
        data: result.data || null,
        message: result.message || 'Lấy thông tin đại lý thành công'
      };
    } catch (error) {
      console.error('Error in AgentService.getAgentById:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin đại lý',
        data: null
      };
    }
  }

  /**
   * Thêm đại lý mới
   * @param {Object} agentData - Dữ liệu đại lý
   * @returns {Promise<Object>} Response với success, data, message
   */
  async createAgent(agentData) {
    try {
      const result = await addAgent(agentData);
      return {
        success: result.status === 'success',
        data: result.data || null,
        message: result.message || 'Thêm đại lý thành công'
      };
    } catch (error) {
      console.error('Error in AgentService.createAgent:', error);
      return {
        success: false,
        error: error.message || 'Không thể thêm đại lý',
        data: null
      };
    }
  }

  /**
   * Cập nhật thông tin đại lý
   * @param {number} agentId - ID đại lý
   * @param {Object} agentData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Response với success, data, message
   */
  async updateAgent(agentId, agentData) {
    try {
      const result = await updateAgent(agentId, agentData);
      return {
        success: result.status === 'success',
        data: result.data || null,
        message: result.message || 'Cập nhật đại lý thành công'
      };
    } catch (error) {
      console.error('Error in AgentService.updateAgent:', error);
      return {
        success: false,
        error: error.message || 'Không thể cập nhật đại lý',
        data: null
      };
    }
  }

  /**
   * Xóa đại lý
   * @param {number} agentId - ID đại lý
   * @returns {Promise<Object>} Response với success, message
   */
  async deleteAgent(agentId) {
    try {
      const result = await deleteAgent(agentId);
      return {
        success: result.status === 'success',
        message: result.message || 'Xóa đại lý thành công'
      };
    } catch (error) {
      console.error('Error in AgentService.deleteAgent:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa đại lý'
      };
    }
  }
}

// Export singleton instance
export default new AgentService();