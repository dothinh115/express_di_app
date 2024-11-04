import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://root:1234@localhost:27017/", {
      dbName: "node",
    });
    console.log("Kết nối thành công đến MongoDB");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};
