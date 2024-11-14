import { Response, NextFunction } from "express";
import { Request } from "../utils/types";
import { AppMiddleware } from "../base/middleware.base";
import { Injectable } from "../decorators/injectable.decorator";

@Injectable()
export class ExecuteHandlerMiddleware implements AppMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let result: any;
    if (req.context) {
      const { context } = req;
      const instance = context.instance;
      const handlerName = context.handlerName;
      result = await instance[handlerName](req, res, next);
    }
    return result;
  }
}
