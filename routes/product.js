const express = require("express");
const router = express.Router();
const {
  getProductById,
  createProduct,
  getProduct,
  getProductPhoto,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllUniqueCategories,
} = require("../controllers/product");
const { getUserById } = require("../controllers/user");
const { isAdmin, isAuthenticated, isSignedIn } = require("../controllers/auth");

// params
router.param("userId", getUserById);
router.param("productId", getProductById);

// create route
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//  read route
router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", getProductPhoto);

// update route
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

// delete route
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

// listing route
router.get("/products", getAllProducts);

router.get("/products/categories", getAllUniqueCategories);

module.exports = router;
