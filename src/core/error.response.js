"use strict";

const { REASON_PHRASES, STATUS_CODE } = require("../constants/httpStatusCode");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = REASON_PHRASES.CONFLICT,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = REASON_PHRASES.CONFLICT,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = REASON_PHRASES.UNAUTHORIZED,
    statusCode = STATUS_CODE.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = REASON_PHRASES.NOT_FOUND,
    statusCode = STATUS_CODE.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError
};
