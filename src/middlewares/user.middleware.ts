import { Response, NextFunction } from "express";
import { AppMiddleware } from "../core/base/middleware.base";
import { Request } from "../core/utils/types";

export class UserMiddleware implements AppMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    console.log("user middleware run");
    next();
  }
}
