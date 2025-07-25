// pages/Verify.jsx - SIMPLE VERSION - NO INFINITE MOUNTING
import React, { useState, useEffect } from "react";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const { verifyUser, btnLoading } = UserData();
  const navigate = useNavigate();

  // Simple token check - ONLY ONCE
  useEffect(() => {
    const verifyToken = localStorage.getItem("verifyToken");
    if (!verifyToken) {
      navigate("/login");
    }
  }, []); // Empty dependency array - runs only once

  const handleVerifyClick = () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    
    verifyUser(Number(otp), navigate);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
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
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Enter OTP:
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            className="border-2 border-gray-300 p-3 w-full rounded-lg outline-none focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            maxLength="6"
          />
        </div>

        <button 
          type="button"
          onClick={handleVerifyClick}
          disabled={btnLoading || otp.length !== 6}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {btnLoading ? <LoadingSpinner /> : "Verify OTP"}
        </button>

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
    </div>
  );
};

export default Verify;