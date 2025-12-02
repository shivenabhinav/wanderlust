// const express = require("express");
// const Razorpay = require("razorpay");
// const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
 // });

// router.post("/create-order", async (req, res) => {
//   try {
//     const options = {
//       amount: req.body.amount * 100, // amount in paise
//       currency: "INR",
//       receipt: `receipt_order_${Date.now()}`,
//     };
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error creating order");
//   }
// });

// module.exports = router;
