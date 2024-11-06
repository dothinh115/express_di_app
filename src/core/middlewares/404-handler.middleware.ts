import { Response, NextFunction } from "express";
import { Request } from "../utils/types";
import { AppMiddleware } from "../base/middleware.base";
import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class NotFoundHandlerMiddleware implements AppMiddleware {
  use(req: Request, res: Response, next: NextFunction): void | Promise<void> {
    res.status(404).send({
      message: "Not Found",
      statusCode: 404,
    });
  }
}
