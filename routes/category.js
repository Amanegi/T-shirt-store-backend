const express = require("express");
const router = express.Router();

const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");
const { isAdmin, isAuthenticated, isSignedIn } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

// params
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

// create routes
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
); // order of middlewares is impotant here

// read routes
router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategory);

// update routes
router.put(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

// delete routes
router.delete(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteCategory
);

module.exports = router;
