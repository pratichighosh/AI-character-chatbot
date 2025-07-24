import React, { useState, useEffect } from "react";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";

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

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    // ✅ FIXED: Only pass otp and navigate, remove fetchChats
    verifyUser(Number(otp), navigate);
  };

  const handleResendOTP = () => {
    setTimeLeft(600); // Reset timer
    setCanResend(false);
    setOtp(""); // Clear current OTP
    resendOTP(navigate);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={submitHandler}
      >
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
            value={otp}
            onChange={handleOtpChange}
            className="border-2 border-gray-300 p-3 w-full rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            maxLength="6"
            required
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

        <button 
          type="submit"
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
          >
            Back to Login
          </button>
        </div>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p>Debug: Check browser console and server logs for OTP details</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Verify;