const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productCartSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product",
  },
  name: String,
  count: Number,
  price: Number,
});

const orderSchema = new mongoose.Schema(
  {
    products: [productCartSchema],
    transaction_id: {},
    amount: Number,
    address: String,
    status: {
      type: String,
      default: "Ordered",
      enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Ordered"],
    },
    updated: Date,
    user: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// throwing two schemas out of the file
const ProductCart = mongoose.model("ProductCart", productCartSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = { ProductCart, Order };
