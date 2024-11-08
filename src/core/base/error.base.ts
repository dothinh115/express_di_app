export class BadRequestException extends Error {
  statusCode: number;
  message: any;
  constructor(message: any = "Bad Request") {
    super(message);
    if (Array.isArray(message)) {
      this.message = message;
    }
    this.statusCode = 400;
  }
}

export class ForbiddenException extends Error {
  statusCode: number;
  message: string;
  constructor() {
    super();
    this.statusCode = 403;
    this.message = "Forbidden";
  }
}

export class UnAuthorizedException extends Error {
  statusCode: number;
  message: string;
  constructor() {
    super();
    this.statusCode = 401;
    this.message = "unauthorized";
  }
}
