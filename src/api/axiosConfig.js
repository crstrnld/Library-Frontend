import axios from 'axios';
import useAuthStore from '../store/authStore';

// ==========================================
// BASE URL CONFIGURATION
// ==========================================
const getBaseURL = () => {
  // Development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/api';
  }
  
  // Production - gunakan backend domain yang benar
  return 'https://library-backend-production-1103.up.railway.app/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
});

console.log('🔗 API Base URL:', axiosInstance.defaults.baseURL);

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🎫 Token attached:', token.substring(0, 20) + '...');
    }
    
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:',  {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 Token expired - Logging out');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
