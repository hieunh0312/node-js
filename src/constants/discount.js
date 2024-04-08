const DISCOUNT_TYPE = {
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage"
};

const DISCOUNT_APPLY = {
  ALL: "all",
  SPECIFIC: "specific"
};

const DISCOUNT_APPLIES = [DISCOUNT_APPLY.ALL, DISCOUNT_APPLY.SPECIFIC];

module.exports = {
  DISCOUNT_TYPE,
  DISCOUNT_APPLIES
};
