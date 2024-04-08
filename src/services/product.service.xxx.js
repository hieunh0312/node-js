"use strict";

const {
  product,
  clothing,
  electronic,
  furniture
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const { PRODUCT_TYPE } = require("../constants/product");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  getAllProducts,
  getProduct,
  updateProductById
} = require("../models/repositories/product.repo");
const { updateNestedObject } = require("../utils");

// Define Factory class to create product
class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  // POST //
  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);

    return new productClass(payload).createProduct();
  }
  // END POST //

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // END PUT //

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async getListSearchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async getAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true }
  }) {
    return await getAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"]
    });
  }

  static async getProduct({ product_id }) {
    return await getProduct({
      product_id,
      unSelect: ["__v", "product_variations"]
    });
  }
  // END QUERY //
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  // Create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }

  async updateProduct(productId, payload) {
    return await updateProductById({ productId, payload, model: product });
  }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if (!newClothing) throw new BadRequestError("Create new Clothing error");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");

    return newProduct;
  }

  async updateProduct(productId) {
    // 1. Remove attr has null or undefined
    // 2. Check xem update ở đâu

    const objectParams = this;

    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        payload: updateNestedObject(objectParams.product_attributes),
        model: clothing
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObject(objectParams)
    );
    return updateProduct;
  }
}

// Define sub-class for different product types Electronics
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if (!newElectronic)
      throw new BadRequestError("Create new Electronic error");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");

    return newProduct;
  }
}

// Define sub-class for different product types Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });
    if (!newFurniture) throw new BadRequestError("Create new Furniture error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");

    return newProduct;
  }
}

// Register
const products = {
  [PRODUCT_TYPE.CLOTHING]: Clothing,
  [PRODUCT_TYPE.ELECTRONICS]: Electronics,
  [PRODUCT_TYPE.FURNITURE]: Furniture
};

Object.entries(products).forEach(([type, classRef]) => {
  ProductFactory.registerProductType(type, classRef);
});

module.exports = ProductFactory;
