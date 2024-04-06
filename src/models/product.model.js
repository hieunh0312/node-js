const { Schema, model } = require("mongoose");

const PRODUCT_DOCUMENT_NAME = "Product";
const PRODUCT_COLLECTION_NAME = "Products";
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true
    },
    product_thumb: {
      type: String,
      required: true
    },
    product_description: {
      type: String,
      required: true
    },
    product_price: {
      type: Number,
      required: true
    },
    product_quantity: {
      type: Number,
      required: true
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"]
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop"
    },
    product_attributes: {
      type: Schema.Types.Mixed
    }
  },
  {
    collection: PRODUCT_COLLECTION_NAME,
    timestamps: true
  }
);

// Define the product type = clothing
const CLOTHING_DOCUMENT_NAME = "Clothing";
const CLOTHING_COLLECTION_NAME = "Clothes";
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true
    },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
  },
  {
    collection: CLOTHING_COLLECTION_NAME,
    timestamps: true
  }
);

// Define the product type = electronic
const ELECTRONIC_DOCUMENT_NAME = "Electronic";
const ELECTRONIC_COLLECTION_NAME = "Electronics";
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true
    },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
  },
  {
    collection: ELECTRONIC_COLLECTION_NAME,
    timestamps: true
  }
);

module.exports = {
  product: model(PRODUCT_DOCUMENT_NAME, productSchema),
  clothing: model(CLOTHING_DOCUMENT_NAME, clothingSchema),
  electronic: model(ELECTRONIC_DOCUMENT_NAME, electronicSchema)
};
