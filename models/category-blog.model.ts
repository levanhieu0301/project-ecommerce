import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    parent: String,
    description: String,
    slug: String
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const CategoryBlog = mongoose.model('CategoryBlog', schema, "categories-blog");

export default CategoryBlog;
