const express = require("express");
const router = express.Router();
const { getUserById, pushOrderInPurchaseList } = require("../controllers/user");
const { isAdmin, isAuthenticated, isSignedIn } = require("../controllers/auth");
const { updateStock } = require("../controllers/product");
const {
  getOrderById,
  createOrder,
  getAllOrders,
  getOrderStatus,
  updateOrderStatus,
} = require("../controllers/order");

// params
router.param("userId", getUserById);
router.param("orderId", getOrderById);

// create routes
router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  pushOrderInPurchaseList,
  updateStock,
  createOrder
);

// read routes
router.get(
  "/order/all/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);

// status routes
router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);
router.put(
  "/order/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateOrderStatus
);

module.exports = router;
