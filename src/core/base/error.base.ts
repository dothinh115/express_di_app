export class BadRequestException extends Error {
  statusCode: number;
  message: any;
  constructor(message: any) {
    super(message);
    if (Array.isArray(message)) {
      this.message = message;
    }
    this.statusCode = 400;
  }
}
