import axios from "axios";
import { store } from "../store";
import { setUser, clearUser } from "../slices/UserSlice";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL,
});

// Add authentication token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user?.accessToken; // Assuming you store the token as 'token'
    
    if (token) {
      // Use Token format instead of Bearer since you're using token authentication
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response && 
        error.response.status === 401 && 
        !originalRequest._retry &&
        originalRequest.url !== 'auth/token/refresh/') { // Add this check to prevent loops
      
      originalRequest._retry = true;

      try {
        console.log('🔁 Attempting to refresh access token...');

        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_BASE_API_URL}/auth/token/refresh/`, 
          {}, 
          { withCredentials: true } // Important for cookies
        );
        
        const newAccessToken = refreshResponse.data.access;

        // Set new token to Redux store
        store.dispatch(setUser({ accessToken: newAccessToken }));

        // Update Authorization header and retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest); // 🔁 Retry the original request
      } catch (refreshError) {
        toast.error('Session expired. Please log in again.');
        console.error('❌ Failed to refresh token', refreshError);
        store.dispatch(clearUser()); // Clear user data on refresh failure
        // Redirect to login page here if needed
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;