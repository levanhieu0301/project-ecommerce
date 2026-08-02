import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    category: [String],
    status: {
      default: "draft",
      type:String,
      enum: ["draft", "published", "archived"] // draft – Bản nháp, published – Đã xuất bản, archived – Đã lưu trữ

    },
    description: String,
    content: String,
    avatar: String,
    publishAt: Date,
    search: String,
    view:{
      default: 0,
      type: Number
    },
    deleted: {
      default: false,
      type: Boolean
    },
    deletedAt: Date

  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const Blog = mongoose.model('Blog', schema, "blogs");

export default Blog;
