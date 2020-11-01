const User = require("../models/user");
const Order = require("../models/order");
const order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found in DB!",
      });
    }

    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  // to hide the sensitive info from the response
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id }, // find the user
    { $set: req.body }, // what needs to be updated
    { new: true, useFindAndModify: false }, // compulsory parameters
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Updation unsuccessful!!",
        });
      }
      // to hide the sensitive info from the response
      user.salt = undefined;
      user.encry_password = undefined;
      //return response
      return res.json(user);
    }
  );
};

exports.getUserPurchaseList = (req, res) => {
  // fetching all the orders from order table that are pushed bu the user having certain id
  Order.find({ user: req.profile._id })
    .populate("user", "_id name") // , not forgot, syntax like this only
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No orders in this account!!",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];

  req.body.order.products.forEach((product) => {
    // to be sent from frontend
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });

  // store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    { new: true }, // new:true = from the old and the new object send the new (updated) one back
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list!!",
        });
      }
      next();
    }
  );
};
