"use strict";

const { Schema, model } = require("mongoose");
const { CART_STATUS_LIST } = require("../constants/cart");

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "carts";

var cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: CART_STATUS_LIST
    },
    cart_products: {
      type: Array,
      required: true,
      default: []
    },
    /*
      cart_products: [
        {
          productId,
          shopId,
          quantity,
          name,
          price
        }
      ]
    */
    cart_count_product: {
      type: Number,
      default: 0
    },
    cart_userId: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.exports = {
  cart: model(DOCUMENT_NAME, cartSchema)
};
