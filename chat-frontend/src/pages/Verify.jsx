import React, { useState, useEffect } from "react";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";
import toast from "react-hot-toast";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const { verifyUser, btnLoading, resendOTP } = UserData();
  const navigate = useNavigate();

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Check if verify token exists on mount
  useEffect(() => {
    const verifyToken = localStorage.getItem("verifyToken");
    if (!verifyToken) {
      navigate("/login");
    }
  }, [navigate]);

  // 🔧 CRITICAL FIX: Completely prevent any form submission behavior
  const submitHandler = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    
    console.log('🚀 MANUAL SUBMIT - Preventing any form submission');
    console.log('📝 OTP entered:', otp);
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    // 🔧 CRITICAL: Call verifyUser function directly
    console.log('🔍 Calling verifyUser function directly...');
    try {
      await verifyUser(otp, navigate);
    } catch (error) {
      console.error('❌ Error in submitHandler:', error);
      toast.error("Verification failed. Please try again.");
    }
  };

  // 🔧 ALTERNATIVE: Direct verification without form
  const handleDirectVerification = async () => {
    console.log('🎯 DIRECT VERIFICATION - Bypassing form completely');
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    await verifyUser(otp, navigate);
  };

  const handleResendOTP = async () => {
    setTimeLeft(600);
    setCanResend(false);
    setOtp("");
    await resendOTP(navigate);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  // 🔧 Handle Enter key - bypass form submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      console.log('⌨️ Enter pressed - calling direct verification');
      handleDirectVerification();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      {/* 🔧 REMOVED FORM - Using div to prevent any form submission */}
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
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={btnLoading}
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

        {/* 🔧 CHANGED: Using onClick instead of form submission */}
        <button 
          type="button"
          onClick={handleDirectVerification}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={btnLoading || otp.length !== 6}
        >
          {btnLoading ? <LoadingSpinner /> : "Verify OTP"}
        </button>

        {/* Resend OTP Button */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!canResend || btnLoading}
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
            disabled={btnLoading}
          >
            Back to Login
          </button>
        </div>

        {/* 🔧 ENHANCED DEBUG INFO */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs">
          <p className="font-semibold text-red-800 mb-2">🐛 DEBUG INFO:</p>
          <p>🎯 Form removed - using direct button clicks</p>
          <p>📡 Request method: POST (forced)</p>
          <p>🔗 URL: /api/user/verify</p>
          <p>📦 Payload: otp + verifyToken</p>
          <p>🔒 Token: {localStorage.getItem('verifyToken') ? '✅ Found' : '❌ Missing'}</p>
          <p>📱 OTP: {otp || 'Not entered'} ({otp.length}/6)</p>
          <p>⚡ Loading: {btnLoading ? 'Yes' : 'No'}</p>
        </div>

        {/* 🔧 TEST BUTTON for direct axios call */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              console.log('🧪 TESTING: Direct axios call');
              const verifyToken = localStorage.getItem("verifyToken");
              
              if (!verifyToken || !otp) {
                toast.error("Missing token or OTP");
                return;
              }

              // Direct axios test
              import('axios').then(axios => {
                axios.default.post('https://ai-character-chatbot-2.onrender.com/api/user/verify', {
                  otp: Number(otp),
                  verifyToken: verifyToken
                })
                .then(response => {
                  console.log('✅ Direct axios SUCCESS:', response.data);
                  toast.success('Direct call worked!');
                })
                .catch(error => {
                  console.error('❌ Direct axios ERROR:', error.response?.data || error.message);
                  toast.error('Direct call failed: ' + (error.response?.data?.message || error.message));
                });
              });
            }}
            className="w-full mt-2 bg-yellow-500 text-white py-2 px-4 rounded text-sm hover:bg-yellow-600"
            disabled={!otp || otp.length !== 6}
          >
            🧪 Test Direct Axios Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;