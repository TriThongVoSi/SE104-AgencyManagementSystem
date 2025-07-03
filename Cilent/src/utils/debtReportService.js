const BASE_URL = "http://localhost:8080";

class DebtReportApiService {
  getAuthHeaders() {
    // Try both possible token keys (consistent with other services)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('🔑 Token found:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('🔑 Auth Token (authToken):', localStorage.getItem('authToken') ? 'EXISTS' : 'NOT FOUND');
    console.log('🔑 Token (token):', localStorage.getItem('token') ? 'EXISTS' : 'NOT FOUND');
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async handleResponse(response) {
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Token expired');
      }
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('❌ Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log('❌ Could not parse error response as JSON');
        const textError = await response.text();
        console.log('❌ Error response text:', textError);
        errorMessage = textError || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('✅ Success response:', result);
    return result;
  }

  async getDebtReport(month, year, agentId) {
    console.log(`🔍 Getting debt report for agent ${agentId}, month ${month}, year ${year}`);
    try {
      const headers = this.getAuthHeaders();
      const url = `${BASE_URL}/api/debt-reports?month=${month}&year=${year}&agentId=${agentId}`;
      console.log('📞 API Call:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('❌ Error getting debt report:', error);
      throw error;
    }
  }

  async getAllDebtReports() {
    console.log('🔍 Getting all debt reports');
    try {
      const headers = this.getAuthHeaders();
      const url = `${BASE_URL}/api/debt-reports/all`;
      console.log('📞 API Call:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('❌ Error getting all debt reports:', error);
      throw error;
    }
  }

  async summarizeDebtReports(month, year) {
    console.log(`🔍 Summarizing debt reports for month ${month}, year ${year}`);
    try {
      const headers = this.getAuthHeaders();
      const url = `${BASE_URL}/api/debt-reports/summarize?month=${month}&year=${year}`;
      console.log('📞 API Call:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('❌ Error summarizing debt reports:', error);
      throw error;
    }
  }

  async getAllAgents() {
    console.log('🔍 Getting all agents');
    try {
      const headers = this.getAuthHeaders();
      const url = `${BASE_URL}/api/agents`;
      console.log('📞 API Call:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Agents response:', result);
        return result.data || [];
      }
      
      // Try different possible endpoints
      console.log('⚠️ Primary agents endpoint failed, trying alternatives...');
      
      // Try without credentials
      try {
        console.log('📞 Trying without credentials...');
        const response2 = await fetch(url, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
        
        if (response2.ok) {
          const result2 = await response2.json();
          console.log('✅ Agents response (no credentials):', result2);
          return result2.data || [];
        }
      } catch (noCreds) {
        console.log('❌ No credentials attempt failed:', noCreds.message);
      }
      
      // Try legacy endpoint
      try {
        console.log('📞 Trying legacy endpoint...');
        const legacyUrl = `${BASE_URL}/getAgents`;
        const response3 = await fetch(legacyUrl);
        
        if (response3.ok) {
          const result3 = await response3.json();
          console.log('✅ Legacy agents response:', result3);
          return result3.data || result3 || [];
        }
      } catch (legacy) {
        console.log('❌ Legacy endpoint failed:', legacy.message);
      }
      
      // If all fail, throw detailed error
      const errorText = await response.text();
      console.log('❌ Final error response:', errorText);
      throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.error('❌ Error getting agents:', error);
      
      // Return empty array instead of throwing to prevent UI crash
      console.log('⚠️ Returning empty agents array to prevent UI crash');
      return [];
    }
  }
  
  // Test connection method
  async testConnection() {
    console.log('🧪 Testing API connection...');
    try {
      const response = await fetch(`${BASE_URL}/actuator/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const health = await response.json();
        console.log('✅ API health check:', health);
        return { healthy: true, details: health };
      } else {
        console.log('⚠️ Health check failed, but API might still work');
        return { healthy: false, status: response.status };
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
      return { healthy: false, error: error.message };
    }
  }
}

export const debtReportApi = new DebtReportApiService();
export default debtReportApi; 