"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// get amount a discount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));

router.get(
  "/list-product-code",
  asyncHandler(discountController.getAllDiscountCodesWithProducts)
);

// authentication //
router.use(authenticationV2);

router.post(
  "/create-discount",
  asyncHandler(discountController.createDiscountCode)
);
router.get(
  "/get-all-discount-codes-by-shop",
  asyncHandler(discountController.getAllDiscountCodes)
);

module.exports = router;
