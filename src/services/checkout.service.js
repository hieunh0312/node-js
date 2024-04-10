"use strict";

const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { BadRequestError } = require("../core/error.response");
const DiscountService = require("./discount.service");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    /*
      {
        cartId,
        userId,
        shop_order_ids: [
          {
            shopId,
            shop_discounts: [],
            item_products: [
              {
                price,
                quantity,
                productId
              },
            ]
          },
          {
            shopId,
            shop_discounts: [
              {
                shopId,
                discountId,
                codeId
              }
            ],
            item_products: [
              {
                price,
                quantity,
                productId
              },
            ]
          }
        ]
      }
     */
    // check cartId ton tai khong?
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart not found");

    const checkout_order = {
      totalPrice: 0, // tong tien hang
      feeShip: 0, // phi van chuyen
      totalDiscount: 0, // tong tien discount giam gia
      totalCheckout: 0 // tong thanh toan
    };
    const shop_order_ids_new = [];

    for (let index = 0; index < shop_order_ids.length; index++) {
      const { shopId, shop_discounts, item_products } = shop_order_ids[index];
      // check product available
      const checkProductServer = await checkProductByServer(item_products);

      if (!checkProductServer[0]) {
        throw new BadRequestError("Order wrong");
      }

      // tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer
      };

      // neu shop_discounts ton tai > 0, check xem hop le khong
      if (shop_discounts.length) {
        // gia su chi co mot discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } =
          await DiscountService.getDiscountAmount({
            codeId: shop_discounts[0].codeId,
            userId,
            shopId,
            products: checkProductServer
          });

        // tong cong discount giam gia
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    };
  }
}

module.exports = CheckoutService;
