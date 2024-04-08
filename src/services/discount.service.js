"use strict";
const { DISCOUNT_APPLY } = require("../constants/discount");
const { SORT_BY } = require("../constants/sort");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findDiscount,
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
      discount_shopId: shopId
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
      discount_shopId: shopId
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
    const discounts = await findAllDiscountCodesUnselect({
      model: discountModel,
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_active: true
      },
      unSelect: ["__v", "discount_shopId"]
    });

    return discounts;
  }
}

module.exports = DiscountService;
