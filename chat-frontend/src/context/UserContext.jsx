import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { server } from "../main";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login function - Send OTP to email
  async function loginUser(email, navigate) {
    if (!email || !email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setBtnLoading(true);
    try {
      console.log(`📧 Sending login request for: ${email}`);
      
      const { data } = await axios.post(`${server}/api/user/login`, { 
        email: email.trim().toLowerCase() 
      });

      console.log("✅ Login request successful:", data.message);
      toast.success(data.message);
      
      localStorage.setItem("verifyToken", data.verifyToken);
      navigate("/verify");
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      
    } finally {
      setBtnLoading(false);
    }
  }

  // 🔧 ENHANCED: Verify OTP function with extensive debugging
  async function verifyUser(otp, navigate) {
    console.log('🚀 === VERIFY USER FUNCTION CALLED ===');
    console.log('📊 Function parameters:', { otp, navigateExists: !!navigate });
    
    const verifyToken = localStorage.getItem("verifyToken");
    console.log('🔒 Retrieved token:', verifyToken ? 'EXISTS' : 'MISSING');
    
    if (!verifyToken) {
      console.error('❌ No verification token found');
      toast.error("Verification token not found. Please login again.");
      navigate("/login");
      return;
    }

    if (!otp || otp.toString().length !== 6) {
      console.error('❌ Invalid OTP:', { otp, length: otp?.toString().length });
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setBtnLoading(true);
    
    try {
      const requestData = {
        otp: Number(otp),
        verifyToken: verifyToken
      };
      
      const requestConfig = {
        method: 'POST',
        url: `${server}/api/user/verify`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestData
      };

      console.log('📤 === MAKING REQUEST ===');
      console.log('🎯 URL:', requestConfig.url);
      console.log('📋 Method:', requestConfig.method);
      console.log('📦 Headers:', requestConfig.headers);
      console.log('📊 Payload:', requestData);
      console.log('🔧 Full Config:', requestConfig);

      // 🔧 CRITICAL: Use explicit axios configuration
      const response = await axios(requestConfig);
      
      console.log('✅ === REQUEST SUCCESSFUL ===');
      console.log('📨 Response status:', response.status);
      console.log('📋 Response headers:', response.headers);
      console.log('📊 Response data:', response.data);

      const { data } = response;
      
      toast.success(data.message);
      
      // Clear old storage and set new authentication token
      localStorage.clear();
      localStorage.setItem("token", data.token);
      
      // Update authentication state
      setIsAuth(true);
      setUser(data.user);
      
      // Navigate to main application
      navigate("/");
      
    } catch (error) {
      console.error('❌ === REQUEST FAILED ===');
      console.error('🚨 Error object:', error);
      console.error('📊 Error response:', error.response);
      console.error('🔧 Error config:', error.config);
      console.error('📡 Request details:', {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data,
        headers: error.config?.headers
      });
      
      // 🔧 SPECIFIC: Check if it's still making GET request
      if (error.config?.method === 'GET') {
        console.error('🚨🚨🚨 CRITICAL: Request was made as GET instead of POST!');
        toast.error('CRITICAL ERROR: Request method changed to GET');
      }
      
      if (error.response) {
        console.error('❌ Response error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
      } else {
        console.error('❌ Request setup error:', error.message);
      }
      
      const errorMessage = error.response?.data?.message || "OTP verification failed. Please try again.";
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 405) {
        console.error("🚨 405 ERROR: Method not allowed");
        toast.error("Method not allowed - check server configuration");
      } else if (error.response?.status === 404) {
        console.error("🚨 404 ERROR: Verify endpoint not found!");
        toast.error("Server error: Verification endpoint not found");
      }
      
    } finally {
      setBtnLoading(false);
      console.log('🏁 === VERIFY FUNCTION COMPLETED ===');
    }
  }

  // Fetch current user profile
  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      console.log("👤 Fetching user profile...");

      const { data } = await axios.get(`${server}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ User profile fetched:", data.email);
      
      setIsAuth(true);
      setUser(data);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Fetch user error:", error);
      
      if (error.response?.status === 403) {
        console.log("🔄 Clearing invalid authentication token");
        localStorage.clear();
        toast.error("Session expired. Please login again.");
      }
      
      setIsAuth(false);
      setUser(null);
      setLoading(false);
    }
  }

  // Logout function
  const logoutHandler = (navigate) => {
    console.log("🚪 User logging out");
    localStorage.clear();
    toast.success("Logged out successfully");
    setIsAuth(false);
    setUser(null);
    if (navigate) {
      navigate("/login");
    }
  };

  // Resend OTP function
  const resendOTP = async (navigate) => {
    const verifyToken = localStorage.getItem("verifyToken");
    
    if (!verifyToken) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(verifyToken.split('.')[1]));
      console.log("🔄 Resending OTP to:", payload.email);
      
      await loginUser(payload.email, navigate);
      
    } catch (error) {
      console.error("❌ Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please login again.");
      localStorage.clear();
      navigate("/login");
    }
  };

  // Check authentication on app load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        loginUser,
        btnLoading,
        isAuth,
        setIsAuth,
        user,
        verifyUser,
        loading,
        logoutHandler,
        resendOTP,
        fetchUser,
      }}
    >
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);