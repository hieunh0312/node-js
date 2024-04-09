"use strict";

const { CART_STATUS } = require("../constants/cart");
const { cart: cartModel } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
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
    const query = { cart_userId: userId, cart_state: CART_STATUS.ACTIVE };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product
      }
    };
    const options = {
      upsert: true,
      new: true
    };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
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

    return await cartModel.findOneAndUpdate(query, updateSet, options);
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

    return await CartService.updateUserCartQuantity({ userId, product });
  }

  static async addToCartV2({ userId, shop_order_ids }) {
    /*
    Update cart
    shop_order_ids: [
      {
        shopId,
        item_products: [
          {
            productId,
            quantity,
            shopId,
            old_quantity,
            price
          }
        ]
      }
    ]
 */
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Product not found");

    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Product not belong to shop");
    }

    if (quantity === 0) {
      // deleted
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = {
      cart_userId: userId,
      cart_state: CART_STATUS.ACTIVE
    };
    const updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    };

    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel.findOne({
      cart_userId: userId
    });
  }
}

module.exports = CartService;
