// context/UserContext.jsx - FIXED VERSION WITH COMPLETE DEBUGGING
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

  // ✅ FIXED: Login function with better debugging
  async function loginUser(email, navigate) {
    if (!email || !email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setBtnLoading(true);
    try {
      console.log(`\n📧 === LOGIN REQUEST STARTING ===`);
      console.log(`📧 Email: ${email}`);
      console.log(`🌐 Server URL: ${server}`);
      console.log(`📤 Full URL: ${server}/api/user/login`);
      
      const { data } = await axios.post(`${server}/api/user/login`, { 
        email: email.trim().toLowerCase() 
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      console.log("✅ Login request successful:", data.message);
      console.log("📨 Response data:", data);
      
      toast.success(data.message);
      
      // Store verification token for OTP verification
      localStorage.setItem("verifyToken", data.verifyToken);
      
      console.log("🎫 Verify token stored in localStorage");
      
      // Navigate to verification page
      navigate("/verify");
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      
      // Enhanced error logging
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      } else if (error.request) {
        console.error("❌ Network error - no response received");
        toast.error("Network error: Cannot reach server");
      }
      
    } finally {
      setBtnLoading(false);
    }
  }

  // ✅ FIXED: Enhanced verify function with comprehensive debugging
  async function verifyUser(otp, navigate, fetchChats) {
    const verifyToken = localStorage.getItem("verifyToken");
    
    if (!verifyToken) {
      toast.error("Verification token not found. Please login again.");
      navigate("/login");
      return;
    }

    if (!otp || otp.toString().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setBtnLoading(true);
    
    try {
      console.log(`\n🔍 === OTP VERIFICATION STARTING ===`);
      console.log(`🔢 OTP: ${otp}`);
      console.log(`🎫 Token: ${verifyToken ? 'Present' : 'Missing'}`);
      console.log(`🌐 Server URL: ${server}`);
      console.log(`📤 Full URL: ${server}/api/user/verify`);
      console.log(`⏰ Time: ${new Date().toISOString()}`);
      
      // ✅ CRITICAL: Test server connectivity first
      console.log(`🔍 Testing server connectivity...`);
      try {
        const pingResponse = await axios.get(`${server}/health`, {
          timeout: 10000
        });
        console.log(`✅ Server ping successful:`, pingResponse.status);
        console.log(`📊 Health check data:`, pingResponse.data);
        
        // Check if user routes are available from health endpoint
        if (pingResponse.data?.criticalEndpoints?.["/api/user/verify"]) {
          console.log(`✅ Verify endpoint status:`, pingResponse.data.criticalEndpoints["/api/user/verify"]);
        }
      } catch (pingError) {
        console.error(`❌ Server ping failed:`, pingError.message);
        toast.error("Cannot connect to server. Please try again.");
        setBtnLoading(false);
        return;
      }

      // ✅ CRITICAL: Make the verification request with detailed logging
      console.log(`📤 Making POST request to: ${server}/api/user/verify`);
      
      const requestData = {
        otp: Number(otp),
        verifyToken,
      };
      
      console.log(`📋 Request data:`, requestData);
      
      // ✅ FIXED: Enhanced axios request with proper headers and error handling
      const { data } = await axios.post(`${server}/api/user/verify`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
        withCredentials: false, // Don't send cookies to avoid CORS issues
      });

      console.log(`✅ === OTP VERIFICATION SUCCESSFUL ===`);
      console.log(`📨 Response:`, data);
      
      toast.success(data.message);
      
      // Clear old storage and set new authentication token
      localStorage.clear();
      localStorage.setItem("token", data.token);
      
      // Update authentication state
      setIsAuth(true);
      setUser(data.user);
      
      // Fetch user chats
      if (fetchChats) {
        await fetchChats();
      }
      
      // Navigate to main application
      navigate("/");
      
    } catch (error) {
      console.error(`\n❌ === OTP VERIFICATION FAILED ===`);
      console.error(`❌ Error type:`, error.name);
      console.error(`❌ Error message:`, error.message);
      
      // ✅ ENHANCED: Detailed error analysis for debugging
      if (error.response) {
        // Server responded with error status
        console.error(`❌ Response status:`, error.response.status);
        console.error(`❌ Response headers:`, error.response.headers);
        console.error(`❌ Response data:`, error.response.data);
        
        if (error.response.status === 404) {
          console.error(`\n❌ === 404 ERROR ANALYSIS ===`);
          console.error(`❌ Route not found: POST ${server}/api/user/verify`);
          console.error(`❌ Possible causes:`);
          console.error(`   1. Backend user routes not mounted properly`);
          console.error(`   2. Wrong server URL: ${server}`);
          console.error(`   3. Backend not deployed or crashed`);
          console.error(`   4. CORS blocking the request`);
          
          // Test if the route exists with a simple GET
          try {
            console.log(`🔍 Testing if backend is reachable...`);
            const testResponse = await axios.get(`${server}/`, { timeout: 5000 });
            console.log(`✅ Backend root accessible:`, testResponse.status);
            console.log(`📊 Backend info:`, testResponse.data);
          } catch (testError) {
            console.error(`❌ Backend completely unreachable:`, testError.message);
          }
          
          toast.error("Server error: OTP verification endpoint not found. Please contact support.");
          
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data?.message || "Invalid OTP or token";
          toast.error(errorMessage);
          
          if (error.response.data?.expired) {
            setTimeout(() => navigate("/login"), 2000);
          }
        } else if (error.response.status === 500) {
          console.error(`❌ Server internal error:`, error.response.data);
          toast.error("Server error occurred. Please try again.");
        } else {
          const errorMessage = error.response.data?.message || "OTP verification failed";
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Request made but no response received
        console.error(`❌ Network error - no response received`);
        console.error(`❌ Request details:`, error.request);
        console.error(`❌ This could be CORS, network, or server down`);
        toast.error("Network error: Cannot reach server. Please check your connection.");
      } else {
        // Request setup error
        console.error(`❌ Request setup error:`, error.message);
        toast.error("Request error: " + error.message);
      }
      
    } finally {
      setBtnLoading(false);
    }
  }

  // ✅ ENHANCED: Fetch user profile with better error handling
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
        timeout: 15000,
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

  // Logout function - preserved as is
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

  // Resend OTP function - preserved as is
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