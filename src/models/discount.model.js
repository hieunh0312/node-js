"use strict";

const { Schema, model } = require("mongoose");
const { DISCOUNT_TYPE, DISCOUNT_APPLIES } = require("../constants/discount");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

const discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true
    },
    discount_description: {
      type: String,
      required: true
    },
    discount_type: {
      type: String,
      default: DISCOUNT_TYPE.FIXED_AMOUNT // fixed_amount || percentage
    },
    discount_value: {
      type: Number, // 10.000, 10
      required: true
    },
    discount_code: {
      type: String, // discountCode
      required: true
    },
    discount_start_date: {
      type: Date, // ngay bat dau
      required: true
    },
    discount_end_date: {
      type: Date, // ngay ket thuc
      required: true
    },
    discount_max_uses: {
      type: Number,
      require: true
    },
    discount_uses_count: {
      type: Number, // so luong discount duoc ap dung
      require: true
    },
    discount_users_used: {
      type: Array, // ai da su dung
      default: []
    },
    discount_max_uses_per_user: {
      type: Number, // so luong cho phep toi da duoc su dung moi user
      require: true
    },
    discount_min_order_value: {
      type: Number,
      require: true
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop"
    },

    discount_is_active: {
      type: Boolean,
      default: true
    },
    discount_applies_to: {
      type: String,
      require: true,
      enum: DISCOUNT_APPLIES
    },
    discount_product_ids: {
      type: Array, // id cua san pham duoc ap dung
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
