"use strict";

const { CART_STATUS } = require("../constants/cart");
const { cart: cartModel } = require("../models/cart.model");

/*
  Key features: Cart service
  - add product to cart [User]
  - reduce product quantity by one [User]
  - increase product quantity by one [User]
  - get cart [User]
  - Delete cart [User]
  - Delete cart item [User]
*/

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { card_userId: userId, cart_state: CART_STATUS.ACTIVE };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product
      }
    };
    const options = {
      insert: true,
      new: true
    };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateQuantity({ userId, product }) {
    const { productId } = product;
    const query = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: CART_STATUS.ACTIVE
    };
    const updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity
      }
    };
    const options = {
      upsert: true,
      new: true
    };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async addToCart({ userId, product }) {
    // check cart ton tai hay khong
    const userCart = await cartModel.findOne({ cart_userId: userId });
    if (!userCart) {
      //create cart for user
      return await CartService.createUserCart({ userId, product });
    }

    // neu co gio hang roi nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    // gio hang ton tai, va co san pham nay thi update quantity

    return await CartService.updateQuantity({ userId, product });
  }
}

module.exports = CartService;
