const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fileSystem = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found in DB!!",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true; // keeps the file extensions same
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image!!",
      });
    }
    // alternative to express-validator on route level
    // destructuring the fields
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields!!",
      });
    }

    let product = new Product(fields);

    // handle file
    if (file.photo) {
      if (file.photo.size > 3 * 1024 * 1024) {
        return res.status(400).json({
          error: "File size too large!",
        });
      }
      // reading file from the filesystem
      product.photo.data = fileSystem.readFileSync(file.photo.path);
      // saving extension type of file
      product.photo.contentType = file.photo.type;
    }
    // saving the product in DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to save the product in DB!!",
        });
      }
      res.json(product); // very bulky for postman
      // res.json({ product: { name, description, category, stock } });
    });
  });
};

exports.getProduct = (req, res) => {
  // req.product.photo = undefined; // for faster data loading
  return res.json(req.product);
};

// middleware
exports.getProductPhoto = (req, res, next) => {
  // for optimization of code
  if (req.product.photo.data) {
    // check that photo is present
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true; // keeps the file extensions same
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image!!",
      });
    }

    // updation code
    let product = req.product;
    // lodash helps in automatically updating the fields inside the product
    product = _.extend(product, fields);

    // handle file
    if (file.photo) {
      if (file.photo.size > 3 * 1024 * 1024) {
        return res.status(400).json({
          error: "File size too large!",
        });
      }
      // reading file from the filesystem
      product.photo.data = fileSystem.readFileSync(file.photo.path);
      // saving extension type of file
      product.photo.contentType = file.photo.type;
    }
    // saving the product in DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update the product in DB!!",
        });
      }
      res.json(product);
    });
  });
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product!!",
      });
    }
    res.json({
      message: "Deletion was successful",
    });
  });
};

// product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  // parseInt because the parameter are by default String
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo") // '-' to not select the photo
    .populate("category")
    .sort([[sortBy, "asc"]]) // format is like that
    .limit(limit) // to get a certain number of product
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product found!!",
        });
      }
      res.json(products);
    });
};

exports.updateStock = (req, res, next) => {
  // for all the products in the order, loop through each and every product,
  // find the product in DB using its _id and update the sold and stock value
  let myOperations = req.body.order.products.map((prod) => {
    return {
      // syntax for bulkWrite operation
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed!!",
      });
    }
  });
  next();
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "No category found!!",
      });
    }
    res.json(categories);
  });
};
