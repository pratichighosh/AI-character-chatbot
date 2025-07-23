import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat is required"],
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [2000, "Question too long"]
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      maxlength: [10000, "Answer too long"]
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
conversationSchema.index({ chat: 1, createdAt: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);