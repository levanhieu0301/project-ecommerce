import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    position: Number,
    images: [String],
    category:[String],
    priceOld: Number,
    priceNew: Number,
    attributes: Array,
    variants: Array,
    description: String,
    content: String,
    status: {
      type: String,
      enum: ["draft","active", "inactive"],
      default: "draft"
    },
    view: {
      type: Number,
      default: 0
    },
    deleted: {
      type: Boolean,
      default: false
    },
    search: String,
    deletedAt: Date

  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const Product = mongoose.model('Product', schema, "products");

export default Product;
