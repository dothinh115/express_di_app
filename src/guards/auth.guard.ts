import { Response, NextFunction } from "express";
import { AppMiddleware } from "../core/base/middleware.base";
import { Injectable } from "../core/decorators/injectable.decorator";
import { Request } from "../core/utils/types";

@Injectable()
export class AuthGuard implements AppMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    console.log("Cần đăng nhập!");

    next();
  }
}
