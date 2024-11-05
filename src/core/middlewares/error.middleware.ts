import { Response, NextFunction } from "express";
import { Request } from "../utils/types";
import { AppErrorMiddleware } from "../base/error-middleware.base";
import { BadRequestException } from "../base/error.base";
import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class ErrorHandlerMiddleware implements AppErrorMiddleware {
  use(error: any, req: Request, res: Response, next: NextFunction): void {
    let message = "Internal Error";
    let statusCode = 500;

    if (error instanceof BadRequestException) {
      message = error.message;
      statusCode = error.statusCode;
    }
    if (res instanceof Response) {
      console.log(error);

      res.status(statusCode).send({
        statusCode,
        message,
      });
    }

    (req as unknown as Response).status(404).send({
      statusCode: 404,
      message: "Not found",
    });
  }
}
