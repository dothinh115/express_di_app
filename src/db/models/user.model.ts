import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Trường name là bắt buộc
      trim: true, // Xoá khoảng trắng đầu/cuối
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email phải duy nhất
      trim: true,
    },
    age: {
      type: Number,
      min: 0, // Đảm bảo tuổi là số dương
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

export { User };
