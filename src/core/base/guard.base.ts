import { Response, NextFunction } from "express";
import { Injectable } from "../decorators/injectable.decorator";
import { Request } from "../utils/types";
import { AppMiddleware } from "./middleware.base";
import { AppContext } from "./context.base";
import { ForbiddenException } from "./error.base";

@Injectable()
export class AppGuard implements AppMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const context = new AppContext(req, res, next);
    try {
      const shouldPass = this.canActive(context);
      if (shouldPass) {
        next();
      } else {
        next(new ForbiddenException());
      }
    } catch (error) {
      next(error);
    }
  }

  canActive(context: AppContext): boolean | Promise<boolean> {
    return false;
  }
}
