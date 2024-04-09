"use strict";
const { DISCOUNT_APPLY, DISCOUNT_TYPE } = require("../constants/discount");
const { SORT_BY } = require("../constants/sort");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findDiscount,
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnselect
} = require("../models/repositories/discount.repo");
const { getAllProducts } = require("../models/repositories/product.repo");

const { convertToObjectIdMongodb } = require("../utils");
/*
  Discount Service
  1 - Generator discount code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [User | Shop]
  4 - Verify discount code [User]
  5 - Delete discount code [Shop | Admin]
  6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user
    } = payload;

    // Checking
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date))
      throw new BadRequestError("Invalid date");

    if (new Date(start_date) > new Date(end_date))
      throw new BadRequestError("Start date must be before end date");

    const foundDiscount = await findDiscount({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });

    if (foundDiscount && foundDiscount.discount_is_active)
      throw new BadRequestError("Discount code already exists");

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === DISCOUNT_APPLY.ALL ? [] : product_ids
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    //
  }

  /*
    Get all discount codes available with products
  */
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit = 50,
    page = 1
  }) {
    // Create index for discount code
    const foundDiscount = await findDiscount({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exits");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;

    if (discount_applies_to === DISCOUNT_APPLY.ALL) {
      products = await getAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: SORT_BY.CTIME,
        select: ["product_name"]
      });
    }

    if (discount_applies_to === DISCOUNT_APPLY.SPECIFIC) {
      products = await getAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: SORT_BY.CTIME,
        select: ["product_name"]
      });
    }

    return products;
  }

  /*
    Get all discount code of shop
  */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesSelect({
      model: discountModel,
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true
      },
      select: ["discount_code", "discount_name"]
    });

    return discounts;
  }

  /*
    Apply discount code
    products = [
      {
        productId,
        shopId,
        quantity,
        name,
        price
      },
      {
        productId,
        shopId,
        quantity,
        name,
        price
      }
    ]
  */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await findDiscount({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });
    if (!foundDiscount) throw new NotFoundError("Discount not exits");

    const {
      discount_end_date,
      discount_is_active,
      discount_max_uses,
      discount_max_uses_per_user,
      discount_min_order_value,
      discount_start_date,
      discount_type,
      discount_users_used,
      discount_value
    } = foundDiscount;

    if (!discount_is_active) throw new BadRequestError("Discount expired");
    if (!discount_max_uses) throw new BadRequestError("Discount are out");
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new NotFoundError("Discount expired");

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount requires a minimum order value of ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsesDiscount = discount_users_used.filter(
        (user) => user.userId === userId
      );

      if (userUsesDiscount.length >= discount_max_uses_per_user) {
        throw new BadRequestError("Discount are out");
      }
    }

    const discountAmount =
      discount_type === DISCOUNT_TYPE.FIXED_AMOUNT
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: discountAmount,
      totalPrice: totalOrder - discountAmount
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    /*
      Check discount used
    */
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });

    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await findDiscount({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });

    if (!foundDiscount) throw new NotFoundError("Discount not exits");

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    });

    return result;
  }
}

module.exports = DiscountService;
