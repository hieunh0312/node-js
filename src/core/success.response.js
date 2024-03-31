"use strict";

const { STATUS_CODE, REASON_PHRASES } = require("../constants/httpStatusCode");

class SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.OK,
    reasonStatusCode = REASON_PHRASES.OK,
    metadata = {}
  }) {
    this.message = message || reasonStatusCode;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, header = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata = {} }) {
    super({
      message,
      metadata
    });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    options = {},
    message,
    metadata = {},
    statusCode = STATUS_CODE.CREATED,
    reasonStatusCode = REASON_PHRASES.CREATED
  }) {
    super({
      message,
      metadata,
      statusCode,
      reasonStatusCode
    });
    this.options = options;
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse
};
