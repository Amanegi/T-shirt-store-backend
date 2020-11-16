const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "ffnwvpwypxvh7frg",
  publicKey: "9kr9tgh3b5xjbb4m",
  privateKey: "76c69f2c131c1d6a2787b630e2528e39",
});

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      res.status(400).send(err);
    } else {
      // pass clientToken to your front-end
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;
  let amountFromTheClient = req.body.amount;
  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (err, result) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.json(result);
      }
    }
  );
};
