const { Schema, model } = require("mongoose");
const { PRODUCT_TYPE } = require("../constants/product");
const slugify = require("slugify");

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
    product_description: String,
    product_price: {
      type: Number,
      required: true
    },
    product_quantity: {
      type: Number,
      required: true
    },
    product_slug: String,
    product_type: {
      type: String,
      required: true,
      enum: [
        PRODUCT_TYPE.ELECTRONICS,
        PRODUCT_TYPE.CLOTHING,
        PRODUCT_TYPE.FURNITURE
      ]
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop"
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      require: true
    },
    // more
    product_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10
    },
    product_variations: {
      type: Array,
      default: []
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false
    }
  },
  {
    collection: PRODUCT_COLLECTION_NAME,
    timestamps: true
  }
);

// create index for search
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: run before .save() and create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

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

// Define the product type = furniture
const FURNITURE_DOCUMENT_NAME = "Furniture";
const FURNITURE_COLLECTION_NAME = "Furnitures";
const furnitureSchema = new Schema(
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
    collection: FURNITURE_COLLECTION_NAME,
    timestamps: true
  }
);

module.exports = {
  product: model(PRODUCT_DOCUMENT_NAME, productSchema),
  clothing: model(CLOTHING_DOCUMENT_NAME, clothingSchema),
  electronic: model(ELECTRONIC_DOCUMENT_NAME, electronicSchema),
  furniture: model(FURNITURE_DOCUMENT_NAME, furnitureSchema)
};
