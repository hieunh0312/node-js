"use strict";

const pick = require("lodash/pick");

const getInfoData = ({ fields = [], object = {} }) => pick(object, fields);

module.exports = {
  getInfoData
};
