"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "inventories";

const inventorySchema = new Schema(
  {
    inven_productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    inven_location: {
      type: String,
      default: "unKnown"
    },
    inven_stock: {
      type: Number,
      required: true
    },
    inven_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop"
    },
    inven_reservations: {
      type: Array,
      default: []
    }
    /*
      cartId: ,
      stock: 1,
      createdOn
    */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
