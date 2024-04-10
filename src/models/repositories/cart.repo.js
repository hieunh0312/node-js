"use strict";

const { cart: cartModel } = require("../cart.model");
const { convertToObjectIdMongodb } = require("../../utils");
const { CART_STATUS } = require("../../constants/cart");
const findCartById = async (cartId) => {
  return await cartModel
    .findOne({
      _id: convertToObjectIdMongodb(cartId),
      cart_state: CART_STATUS.ACTIVE
    })
    .lean();
};

module.exports = {
  findCartById
};
