import { Response, NextFunction } from "express";
import { Request } from "../utils/types";
import { AppErrorMiddleware } from "../base/error-middleware.base";
import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class ErrorHandlerMiddleware implements AppErrorMiddleware {
  use(error: any, req: Request, res: Response, next: NextFunction): void {
    if (next === undefined) return (res as unknown as NextFunction)();

    let message = error.message ?? "Internal Error";
    let statusCode = error.statusCode ?? 500;

    console.log(error);

    res.status(statusCode).send({
      statusCode,
      message,
    });
  }
}
