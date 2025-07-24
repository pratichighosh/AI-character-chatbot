// pages/Verify.jsx - FINAL FIXED VERSION - NO MORE GET REQUESTS
import React, { useState, useEffect } from "react";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
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

  // ✅ COMPLETELY PREVENT ANY FORM SUBMISSION
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🛑 Form submission prevented - using button click instead");
    return false;
  };

  // ✅ DIRECT BUTTON CLICK - NO FORM SUBMISSION
  const handleVerifyClick = () => {
    console.log('🔍 === VERIFY BUTTON CLICKED ===');
    console.log('🔍 OTP:', otp);
    console.log('🔍 Will make POST request via verifyUser()');
    
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    // ✅ This makes the correct POST request
    verifyUser(Number(otp), navigate);
  };

  // ✅ ENTER KEY HANDLER
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleVerifyClick();
    }
  };

  const handleResendOTP = () => {
    setTimeLeft(600);
    setCanResend(false);
    setOtp("");
    resendOTP(navigate);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      {/* ✅ FORM WITH COMPLETE PREVENTION */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to your email
          </p>
        </div>

        {/* ✅ NO FORM TAG - JUST DIV TO PREVENT ANY SUBMISSION */}
        <div onSubmit={handleFormSubmit}>
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

          {/* ✅ DIRECT BUTTON - NO FORM SUBMISSION */}
          <button 
            type="button"
            onClick={handleVerifyClick}
            disabled={btnLoading || otp.length !== 6}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-2 bg-green-100 rounded text-xs text-green-800">
          <p>✅ Fixed: No form submission - only button clicks</p>
          <p>✅ Uses POST request via verifyUser() function</p>
          <p>✅ No GET requests will be made</p>
        </div>
      </div>
    </div>
  );
};

export default Verify;