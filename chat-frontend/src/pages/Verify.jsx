// pages/Verify.jsx - COMPLETELY ISOLATED - NO AUTO REQUESTS
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../main";

// ✅ COMPLETELY ISOLATED COMPONENT
const Verify = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  console.log('🔍 Verify component mounted - NO AUTO REQUESTS WILL BE MADE');

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    console.log('⏰ Timer effect running - NO REQUESTS');
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Check token ONLY - NO REQUESTS
  useEffect(() => {
    console.log('🎫 Checking token - NO REQUESTS WILL BE MADE');
    const verifyToken = localStorage.getItem("verifyToken");
    if (!verifyToken) {
      console.log('❌ No token found, redirecting to login');
      navigate("/login");
    } else {
      console.log('✅ Token found, staying on verify page');
    }
  }, [navigate]);

  // ✅ MANUAL VERIFY - ONLY WHEN BUTTON CLICKED
  const handleVerifyClick = async () => {
    console.log('🔍 === MANUAL VERIFY BUTTON CLICKED ===');
    console.log('🔍 OTP:', otp);
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const verifyToken = localStorage.getItem("verifyToken");
    if (!verifyToken) {
      toast.error("Verification token not found. Please login again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Making POST request to verify...');
      console.log('📤 URL:', `${server}/api/user/verify`);
      console.log('📤 Method: POST');
      console.log('📤 Body:', { otp: Number(otp), verifyToken });
      
      const { data } = await axios.post(`${server}/api/user/verify`, {
        otp: Number(otp),
        verifyToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ OTP verification successful:", data.message);
      toast.success(data.message);
      
      // Clear old storage and set new authentication token
      localStorage.clear();
      localStorage.setItem("token", data.token);
      
      // Navigate to main application
      navigate("/");
      
    } catch (error) {
      console.error("❌ Verification error:", error);
      
      if (error.response?.status === 404) {
        toast.error("Verification endpoint not found. Please contact support.");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid OTP or token");
      } else {
        toast.error("Verification failed. Please try again.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANUAL RESEND
  const handleResendOTP = async () => {
    const verifyToken = localStorage.getItem("verifyToken");
    
    if (!verifyToken) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(verifyToken.split('.')[1]));
      console.log("🔄 Resending OTP to:", payload.email);
      
      const { data } = await axios.post(`${server}/api/user/login`, { 
        email: payload.email
      });

      toast.success(data.message);
      localStorage.setItem("verifyToken", data.verifyToken);
      setTimeLeft(600);
      setCanResend(false);
      setOtp("");
      
    } catch (error) {
      console.error("❌ Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please login again.");
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyClick();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to your email
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="otp">
            Enter OTP:
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={handleOtpChange}
            onKeyDown={handleKeyDown}
            className="border-2 border-gray-300 p-3 w-full rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            maxLength="6"
            autoComplete="one-time-code"
          />
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          {!canResend ? (
            <p className="text-sm text-gray-600">
              OTP expires in: <span className="font-mono font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-medium">
              OTP has expired
            </p>
          )}
        </div>

        {/* ✅ MANUAL BUTTON - NO FORM */}
        <button 
          type="button"
          onClick={handleVerifyClick}
          disabled={loading || otp.length !== 6}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner /> : "Verify OTP"}
        </button>

        {/* Resend OTP Button */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!canResend || loading}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canResend ? "Resend OTP" : "Resend available after timer expires"}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Back to Login
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 p-2 bg-blue-100 rounded text-xs text-blue-800">
          <p>✅ Component isolated - no auto requests</p>
          <p>✅ Only manual button clicks make requests</p>
          <p>✅ All requests are POST method</p>
        </div>
      </div>
    </div>
  );
};

export default Verify;