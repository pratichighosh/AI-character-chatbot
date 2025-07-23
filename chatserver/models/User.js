// REPLACE YOUR ENTIRE models/User.js WITH THIS:

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ]
    },
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: Use default export
export default mongoose.model("User", userSchema);