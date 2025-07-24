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
      
      // ✅ CORRECT: POST request to /api/user/login
      const { data } = await axios.post(`${server}/api/user/login`, { 
        email: email.trim().toLowerCase() 
      });

      console.log("✅ Login request successful:", data.message);
      toast.success(data.message);
      
      // Store verification token for OTP verification
      localStorage.setItem("verifyToken", data.verifyToken);
      
      // Navigate to verification page
      navigate("/verify");
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      
    } finally {
      setBtnLoading(false);
    }
  }

  // ✅ FIXED: Verify OTP function with correct POST request
  async function verifyUser(otp, navigate) {
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
      console.log(`🔍 Verifying OTP: ${otp}`);
      console.log(`📤 Making POST request to: ${server}/api/user/verify`);
      
      // ✅ CRITICAL FIX: Use axios.post() instead of axios() for cleaner implementation
      const { data } = await axios.post(`${server}/api/user/verify`, {
        otp: Number(otp),
        verifyToken: verifyToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ OTP verification successful:", data.message);
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
      console.error("❌ Verification error:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url
        }
      });
      
      const errorMessage = error.response?.data?.message || "OTP verification failed. Please try again.";
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 405) {
        console.error("🚨 405 ERROR: Method not allowed - check if backend expects POST");
        toast.error("Server error: Invalid request method");
      } else if (error.response?.status === 404) {
        console.error("🚨 404 ERROR: Verify endpoint not found!");
        console.error("🔧 Check backend route mounting");
        toast.error("Server error: Verification endpoint not found");
      } else if (error.response?.data?.expired) {
        toast.error("OTP has expired. Please request a new one.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.data?.invalid) {
        toast.error("Invalid verification token. Please try login again.");
        localStorage.clear();
        setTimeout(() => navigate("/login"), 2000);
      }
      
    } finally {
      setBtnLoading(false);
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
      
      // Clear invalid token
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
      // Decode token to get email (basic decode, not verification)
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